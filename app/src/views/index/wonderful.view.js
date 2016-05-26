/*
  精彩饭趴
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var View = BaseView.extend({
  el: '.perfect-wrap',
  clientRender: false,
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.wonderfulItemTpl = this.$el.find('#wonderfulItemTpl').html();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    this.renderList({});
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 渲染列表
  renderList: function (data) {
    var html = this.compileHTML(this.wonderfulItemTpl, data);

    this.$el.find('#wonderfulList').html(html);
  }
});

module.exports = View;
