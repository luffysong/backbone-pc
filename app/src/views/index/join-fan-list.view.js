/*
  入驻站子
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var View = BaseView.extend({
  el: '.fan-wrap',
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

    this.joinFanItemTpl = this.$el.find('#joinFanListTpl').html();
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
    var html = this.compileHTML(this.joinFanItemTpl, data);

    this.$el.find('.join-fan-wrap').html(html);
  }
});

module.exports = View;
