/**
 * 频道节目单管理
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var CreatePlayListView = require('./create-channel-video.view');

var View = BaseView.extend({
  el: '#tabChannel',
  rawLoader: function () {
    return require('./template/channel-video-main.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化

    this.createView = new CreatePlayListView();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  }
});

module.exports = View;
