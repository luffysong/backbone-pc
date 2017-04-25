'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var RecommendView = require('./recommended.view');
var TopBarView = require('TopBarView');
// var PlaybackView = require('./playback.view');

var WonderfulView = require('./wonderful.view');
var OfficialView = require('./official.view');
var IndexTags = require('./index-tags.view');

var View = BaseView.extend({
  clientRender: false,
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.indexParameter = {
      id: 110
    };
    // 通用顶部
    this.topbar = new TopBarView();
  },
  afterMount: function () {
    //  获取DOM Node
  },
  ready: function () {
    // 顶部推荐
    this.recommendview = new RecommendView();
    // 回放
    // this.playback = new PlaybackView();
    // 精彩饭趴
    this.wonderfulView = new WonderfulView({
      topbar: this.topbar
    });

    // tag列表
    this.indexTags = new IndexTags({
      topbar: this.topbar
    });

    // 官方频道
    this.officialView = new OfficialView();
    // this.fanChannelView = new FanChannelView();
    // this.joinFanListView = new JoinFanListView();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  }
});

module.exports = View;
