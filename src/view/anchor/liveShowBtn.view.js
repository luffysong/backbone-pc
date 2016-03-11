/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-3-9
 * @author  YuanXuJia
 * @info 直播按钮控制
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var LiveShowModel = require('../../model/anchor/liveShowBtn.model'); //View的基类

var View = BaseView.extend({
  el: '#live-show-btn-wraper', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return require('../../template/anchor/liveShowBtn.html');
  },
  events: { //监听事件
    'click .endLive': 'endLiveShow',
    'click .startLive': 'startLiveShow'
  },
  //当模板挂载到元素之前
  beforeMount: function () {

  },
  //当模板挂载到元素之后
  afterMount: function () {
    this.btnEndLive = $('.endLive');
  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    var s = 1;

  },
  /**
   * 开启直播
   */
  startLiveShow: function(e) {
    var current = $(e.target);
    if(current.hasClass('m_disabled')){
      return null;
    }
    current.addClass('m_disabled');
    this.btnEndLive.removeClass('m_disabled');
  },
  /**
   * 结束直播
   */
  endLiveShow: function (e) {
    var current = $(e.target);
    if(current.hasClass('m_disabled')){
      return null;
    }
    current.addClass('m_disabled');
  }
});

module.exports = View;