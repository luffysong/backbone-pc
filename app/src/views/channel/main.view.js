/**
 * 全部频道 视频列表页
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var _ = require('underscore');

var Auxiliary = require('auxiliary-additions');
var URL = Auxiliary.url;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var LivePreviewModel = require('../../models/index/live-pre.model');
var PlaybackModel = require('../../models/index/playback.model');
var ChannelModel = require('../../models/index/channel.model');
var PushRoom = require('../live-room/push-room');
var DateTime = require('BusinessDate');

var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: '.channelHeader',
  events: {
    'click .channelNav': 'channelChanged'
  },
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    var url = URL.parse(location.href);
    this.listType = url.query.list || '';

    this.queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken()
    };
    this.livePreViewParams = _.extend({}, this.queryParams, {
      size: 9999,
      order: 'POPULARITY' // TIME
    });

    this.playbackPageSize = 12;

    this.playbackParameter = _.extend({}, this.queryParams, {
      offset: 0,
      size: this.playbackPageSize,
      order: 'TIME'
    });

    // 官方, 站子参数
    this.channelParams = _.extend({}, this.queryParams, {
      size: 16,
      type: ''
    });

    this.livePreViewModel = new LivePreviewModel();
    this.playbackModel = new PlaybackModel();
    this.channelModel = new ChannelModel();

    // 当前频道
    this.channelType = 0;

    this.hasData = {
      0: true,
      1: true,
      2: true
    };

    this.pushRoom = new PushRoom({});
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.livePreViewItemTpl = $('#livePreViewTpl').html();
    this.playbackItemTpl = $('#playbackTpl').html();

    this.livepreViewList = $('#livePreViewWrap');
    this.playbackList = $('#playbackWrap');

    this.viedoItemTpl = $('#viedoItemTpl').html();

    this.allContainerDOM = $('.section');
  },
  ready: function () {
    //  初始化
    var self = this;
    this.currentPage = {};
    this.totalCount = {};
    this.getPageList();

    this.renderLivePreViewList();

    $(document).on('scroll', function (e) {
      self.bodyScroll(e);
    });
    $('.viedo-content').on('click', function (e) {
      self.pushRoomHandler(e);
    });
    this.renderOfficeVideoList();
    // this.channelType = 0;
    if (this.listType === 'yyt') {
      this.channelChanged({
        target: 'a[data-tag="1"]'
      });
    }
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 渲染热门直播列表
  renderLivePreViewList: function () {
    var self = this;
    var html = '';
    var promise = this.livePreViewModel.executeJSONP(this.livePreViewParams);

    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        html = self.compileHTML(self.livePreViewItemTpl, res);
        self.livepreViewList.html(html);
      }
    });
  },
  renderOfficeVideoList: function () {
    var self = this;
    self.channelParams.type = 'YYT';
    self.channelParams.offset = 0;
    var promise = self.channelModel.executeJSONP(self.channelParams);
    var type = 1;
    promise.done(function (res) {
      self.renderViedoList(res, 1);
      if (!self.totalCount[type]) {
        self.totalCount[type] = res.data.totalCount;
      }
    });
  },
  // 获取分页列表
  getPageList: function (pageIndex) {
    var self = this;
    var promise;
    var page = pageIndex || 1;
    if (!pageIndex) {
      this.currentPage[this.channelType] = page;
    }
    switch (this.channelType) {
      case 0:
        this.playbackParameter.offset = (page - 1) * this.playbackPageSize;
        promise = self.playbackModel.executeJSONP(this.playbackParameter);
        promise.done(function (res) {
          self.renderList(res);
          if (!self.totalCount[self.channelType]) {
            self.totalCount[self.channelType] = res.data.totalCount;
          }
          if (res.data.length <= 0) {
            self.hasData[self.channelType] = false;
          }
        });
        break;
      case 1: // 官方频道
      case 2: // 站子频道
        self.channelParams.type = this.channelType === 1 ? 'YYT' : 'FANS';
        self.channelParams.offset = (page - 1) * self.channelParams.size;
        promise = self.channelModel.executeJSONP(this.channelParams);
        promise.done(function (res) {
          self.renderViedoList(res);
          if (!self.totalCount[self.channelType]) {
            self.totalCount[self.channelType] = res.data.totalCount;
          }
          if (res.data.length <= 0) {
            self.hasData[self.channelType] = false;
          }
        });
        break;
      default:
        break;
    }
  },
  // 渲染回放
  renderList: function (data) {
    var result = this.formatData(data);
    var html = this.compileHTML(this.playbackItemTpl, result);
    this.playbackList.append(html);
  },
  // 渲染官方 or 站子
  renderViedoList: function (data, type) {
    var html = this.compileHTML(this.viedoItemTpl, data);
    $('#channelSection-' + (type || this.channelType)).append(html);
  },
  // 格式化时间
  formatData: function (data) {
    var time;
    var result;
    if (data) {
      _.each(data.data, function (item) {
        var curItem = item;
        time = new Date(item.startTime);
        result = DateTime.difference(item.duration);
        curItem.startTimeTxt = DateTime.format(time, 'yyyy/MM/dd');
        curItem.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
      });
    }
    return data;
  },
  // 绑定页面滚动事件
  bodyScroll: function (e) {
    var target = $(e.target);
    var scrollTop = target.scrollTop();
    var wrapHeight = $('.scroll-' + this.channelType).height();
    var diff = scrollTop - wrapHeight;
    var temp = {
      0: -165,
      1: -520,
      2: -520
    };
    // 距离底部还有多远时,加载下一页面
    if (diff > temp[this.channelType] && this.hasData[this.channelType]) {
      this.currentPage[this.channelType] = this.currentPage[this.channelType] || 1;
      this.currentPage[this.channelType]++;
      this.getPageList(this.currentPage[this.channelType]);
    }
  },
  // 切换频道
  channelChanged: function (e) {
    var target = $(e.target);
    if (target.attr('data-tag') !== undefined) {
      // this.clearSection();
      this.channelType = ~~target.attr('data-tag');
      target.parent().children().removeClass('active');
      target.addClass('active');
      this.allContainerDOM.hide();
      $('.section-' + this.channelType).show();
      // this.getPageList(this.currentPage[this.channelType]);
    }
  },
  // 切换频道是清空dom
  clearSection: function () {
    // this.livepreViewList.find('.item').remove();
    // this.playbackList.find('.item').remove();
    // $('#channelSection-' + this.channelType).find('.item').remove();
    $('.viedo-content:not([id="livePreViewWrap"])').find('.item').remove();
  },
  // 设置默认频道
  setDefaultChannel: function () {},
  // 顶上去
  pushRoomHandler: function (e) {
    var target = $(e.target);
    var self = this;
    if (!target.hasClass('am-btn')) {
      target = target.parent('.am-btn');
    }
    var roomId = target.attr('data-roomId');
    if (roomId) {
      this.pushRoom.setOptions({
        roomId: roomId,
        okFn: function () {
          msgBox.showOK('感谢您的支持');
          self.updateNumber(target.parents('.item'));
        }
      });
      this.pushRoom.topClick();
    }
  },
  updateNumber: function (el) {
    var target = el.find('.white');
    if (target) {
      var txt = target.text();
      // 积分
      target.text(~~txt + 20);
    }
  }
});

module.exports = View;
