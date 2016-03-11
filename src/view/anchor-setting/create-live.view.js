/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var YYTIMServer = require('../../lib/YYT_IM_Server');

var View = BaseView.extend({
  el: '#tab-create', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return require('../../template/anchor-setting/create-live.html');
  },
  events: { //监听事件

  },
  //当模板挂载到元素之前
  beforeMount: function () {
    YYTIMServer.init({
      listeners: {
        onMsgNotify: this.onMsgNotify,
        onGroupInfoChangeNotify: this.onGroupInfoChangeNotify,
        groupSystemNotifys: this.groupSystemNotifys
      }
    });
  },
  //当模板挂载到元素之后
  afterMount: function () {

  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {

  },
  onMsgNotify: function (notifyInfo) {
    console.log('1', notifyInfo);
  },
  onGroupInfoChangeNotify: function (notifyInfo) {
    console.log('2', notifyInfo);
  },
  groupSystemNotifys: function (notifyInfo) {
    console.log('3', notifyInfo);
  }
});

module.exports = View;