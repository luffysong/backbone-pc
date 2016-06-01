/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var PlayedListModel = require('../../models/live-room/played-list.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var Backbone = window.Backbone;

var View = BaseView.extend({
  clientRender: false,
  el: '#anchorPlayedList', // 设置View对象作用于的根元素，比如id
  events: { // 监听事件

  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.defineEventInterface();
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    var el = this.$el;
    this.anchorPlayedTpl = $('#anchorPlayedTpl').html();

    this.playedList = el.find('#playedListWrap');

    this.playedListModel = PlayedListModel.sharedInstanceModel();

    this.playedListParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      anchor: '',
      order: 'time',
      offset: 0,
      size: 9
    };
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    // this.initCarousel();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
        self.bindData(data.creator.uid);
      }
    });
    console.log(Backbone._events);
  },
  initCarousel: function () {
    var warp = $('#palyedJcarousel');
    var jcarousel = warp.find('.jcarousel');
    var carousel;
    var width;

    jcarousel
      .on('jcarousel:reload jcarousel:create', function () {
        carousel = $(this);
        width = carousel.innerWidth();
        width = width / 4;

        carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
      })
      .jcarousel({
        wrap: 'circular'
      });

    warp.find('.jcarousel-control-prev')
        .jcarouselControl({
          target: '-=1'
        });

    warp.find('.jcarousel-control-next')
        .jcarouselControl({
          target: '+=1'
        });
  },
  bindData: function (anchorId) {
    var self = this;
    var template;
    var promise;
    this.playedListParams.anchor = anchorId;

    promise = this.playedListModel.executeJSONP(this.playedListParams);
    promise.done(function (res) {
      if (res && res.msg === 'SUCCESS' && res.data.totalCount > 0) {
        // template = _.template(self.anchorPlayedTpl);
        console.log('res=', res, self.anchorPlayedTpl);
        template = self.compileHTML(self.anchorPlayedTpl, res);
        self.playedList.html(template);
        self.initCarousel();
      } else {
        self.hideListWrap();
      }
    });
    promise.fail(function () {
      self.hideListWrap();
    });
  },
  hideListWrap: function () {
    this.$el.hide();
  }
});

module.exports = View;
