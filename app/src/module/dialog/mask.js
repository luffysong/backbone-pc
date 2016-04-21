/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //  View的基类
var doc = $(document);
var isIE6 = navigator.userAgent.indexOf('MSIE 6.0') !== -1;
var style = {
  position: isIE6 ? 'absolute' : 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: isIE6 ? doc.outerHeight(true) : '100%',
  display: 'none',
  'z-index': 998,
  opacity: 0.2,
  'background-color': 'black'
};
var View = BaseView.extend({
  clientRender: false,
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.element = $('<iframe/>').attr({
      frameborder: 0,
      scrolling: 'no'
    }).css(style).appendTo(document.body);
  },
  // 当模板挂载到元素之后
  afterMount: function () {

  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {

  },
  show: function () {
    this.element.fadeIn();
  },
  hide: function () {
    this.element.fadeOut();
  }
});

var shared = null;
View.sharedInstanceMask = function () {
  if (!shared) {
    shared = new View();
  }
  return shared;
};
View.classInstanceMask = function () {
  return new View();
};
module.exports = View;
