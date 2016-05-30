/**
 * 全部频道
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var _ = require('underscore');

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var LivePreviewModel = require('../../models/index/live-pre.model');
var PlaybackModel = require('../../models/index/playback.model');
var ChannelModel = require('../../models/index/channel.model');

var DateTime = require('BusinessDate');

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
  getPageList: function (pageIndex) {
    var self = this;
    var promise;
    var page = pageIndex || 1;
    if (!pageIndex) {
      this.currentPage[this.channelType] = page;
    }

    switch (this.channelType) {
      default:
      case '0':
        this.playbackParameter.offset = (page - 1) * this.playbackPageSize;
        promise = self.playbackModel.executeJSONP(this.playbackParameter);
        promise.done(function (res) {
          self.renderList(res);
          if (!self.totalCount[self.channelType]) {
            self.totalCount[self.channelType] = res.data.totalCount;
          }
        });
        break;
      case '1':
      case '2':
        // TODO
        self.channelParams.type = this.channelType === '1' ? 'YYT' : 'YYT';
        self.channelParams.offset = (page - 1) * self.channelParams.size;
        promise = self.channelModel.executeJSONP(this.channelParams);
        promise.done(function (res) {
          self.renderViedoList(res);
          if (!self.totalCount[self.channelType]) {
            self.totalCount[self.channelType] = res.data.totalCount;
          }
        });
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
  renderViedoList: function (data) {
    var html = this.compileHTML(this.viedoItemTpl, data);
    $('#channelSection-' + this.channelType).append(html);
  },
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
  bodyScroll: function (e) {
    var target = $(e.target);
    var scrollTop = target.scrollTop();
    var wrapHeight = $('.scroll-' + this.channelType).height();
    var diff = scrollTop - wrapHeight;
    console.log('scrollTop:' + scrollTop, 'wrapHeight:', wrapHeight, diff);
    var temp = {
      0: -165,
      1: -520,
      2: -520
    };
    // 距离底部还有多远时,加载下一页面
    if (diff > temp[this.channelType]) {
      this.currentPage[this.channelType] = this.currentPage[this.channelType] || 1;
      this.currentPage[this.channelType]++;
      this.getPageList(this.currentPage[this.channelType]);
    }
  },
  // 切换频道
  channelChanged: function (e) {
    var target = $(e.target);
    if (target.attr('data-tag') !== undefined) {
      this.clearSection();
      this.channelType = target.attr('data-tag');
      target.parent().children().removeClass('active');
      target.addClass('active');
      this.allContainerDOM.hide();
      $('.section-' + this.channelType).show();
      this.getPageList(this.currentPage[this.channelType]);
    }
  },
  clearSection: function () {
    // this.livepreViewList.find('.item').remove();
    // this.playbackList.find('.item').remove();
    // $('#channelSection-' + this.channelType).find('.item').remove();
    $('.viedo-content:not([id="livePreViewWrap"])').find('.item').remove();
  }
});

module.exports = View;
