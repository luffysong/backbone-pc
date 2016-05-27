/*
 直播频道
 */
'use strict';

var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;
// 首页轮播
var CarouselModel = require('../../models/index/carousel.model');
var FanUserModel = require('../../models/index/fan-user.model');
var ChannelModel = require('../../models/index/channel.model');

// var msgBox = require('ui.msgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var FlashApi = require('FlashApi');

var View = BaseView.extend({
  el: '#topContainer',
  events: {
    'click .gotoLiveHome': 'gotoLiveHome'
  },
  context: function () {
    // console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.recommendParameter = {
      deviceinfo: '{"aid":"30001001"}'
    };
    this.recommendParameter.access_token = user.getWebToken();

    this.queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken()
    };

    this.carouselModel = new CarouselModel();
    this.fanUserModel = new FanUserModel();
    this.channelModel = new ChannelModel();
  },
  afterMount: function () {
    // 读取整个模块的模板
    this.recommendTpl = this.$el.find('#recommendTpl').html();
    // 获取右侧列表模板
    this.livingItemTpl = this.$el.find('#liveItemTpl').html();
  },
  ready: function () {
    //  初始化
    this.renderList();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  getCarouselList: function () {
    var params = _.extend(this.queryParams, {
      offset: 0,
      size: 5
    });
    return this.carouselModel.executeJSONP(params);
  },
  recommendRender: function (data) {
    var status = data.status;
    var flashData = data;
    var html = this.compileHTML(this.recommendTpl, {
      data: data
    });
    this.$el.html(html);
    if (status === 3 || status === 2) {
      this.FlashApi = FlashApi.sharedInstanceFlashApi({
        el: 'topFlash',
        props: {
          width: 980,
          height: 550
        }
      });
    }
    if (this.FlashApi) {
      this.FlashApi.onReady(function () {
        flashData.isIndex = true;
        this.init(flashData);
      });
    }

    this.renderList({});
  },
  // 渲染右侧列表
  renderList: function () {
    var self = this;
    var html = '';
    var promise = this.getCarouselList();
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        html = self.compileHTML(self.recommendTpl, res.data[0]);
        self.$el.html(html);

        html = self.compileHTML(self.livingItemTpl, res);
        self.$el.find('#livingList').html(html);
      }
    });
  },
  setFlash: function () {

  },
  gotoLiveHome: function (e) {
    var el = $(e.currentTarget);
    var id = el.attr('data-id');
    var status = ~~(el.attr('data-status'));
    switch (status) {
      case 2:
        //  处理直播
        window.location.href = 'liveRoom.html?roomId=' + id;
        break;
      case 3:
        //  处理回放
        window.location.href = 'playback.html?roomId=' + id;
        break;
      default:
      //  默认不处理
    }
  }
});

module.exports = View;
