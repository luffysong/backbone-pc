/*
 站子频道
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var View = BaseView.extend({
  el: '.fan-channel-wrap',
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node

    // item模板
    this.channelItemTpl = this.$el.find('#fanChannelItemTpl').html();
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
  renderList: function (data) {
    var html = this.compileHTML(this.channelItemTpl, data);

    this.$el.find('.fan-list').html(html);
  }
});

module.exports = View;
