'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var RecommendView = require('./recommended.view');
var TopBarView = require('TopBarView');
var LivePreView = require('./livePre.view');
var PlaybackView = require('./playback.view');
var View = BaseView.extend({
  el: '#indexContent',
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.indexParameter = {
      id: 110
    };
    this.topbar = new TopBarView();
  },
  afterMount: function () {
    //  获取DOM Node

  },
  ready: function () {
    this.recommendview = new RecommendView();
    this.livepre = new LivePreView({
      topbar: this.topbar
    });
    this.playback = new PlaybackView();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null

  },
  destroyed: function () {
    //  销毁之后
  }
});

module.exports = View;