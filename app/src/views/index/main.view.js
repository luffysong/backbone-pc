'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var View = BaseView.extend({
  el: '#indexContent',
  rawLoader: function () {
    // return indexTemp;
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.indexParameter = {
      id: 110
    };
  },
  afterMount: function () {
    //  获取DOM Node

  },
  ready: function () {

  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null

  },
  destroyed: function () {
    //  销毁之后
  }
});

module.exports = View;
