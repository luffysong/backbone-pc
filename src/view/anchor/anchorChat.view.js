/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info 聊天控制
 */

var BaseView = require('BaseView'); //View的基类
var StartModel = require('../../model/anchorStart.model');
var EndModel = require('../../model/anchorEnd.model');
var YYTIMServer = require('../../lib/YYT_IM_Server');


var View = BaseView.extend({
  el: '#anchor_ctrl_chat', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return require('../../template/chat.html');
  },
  events: { //监听事件
    'click #btn-clear': 'clearHandler',
    'click #btn-lock': 'lockHandler',
    'click #msg-list': 'messageClickHandler'

  },
  //当模板挂载到元素之前
  beforeMount: function () {

  },
  //当模板挂载到元素之后
  afterMount: function () {
    //this.btnClear = $('#btn-clear');
    //背景图片元素
    this.themeBgEle = $('#anchor-container-bg');

    this.messageTpl = '';
    this.controlBtns = $('#control-btns');
    this.msgList = $('#msg-list');

    //注册IM事件处理
    YYTIMServer.init({
      listeners: {
        onMsgNotify: this.onMsgNotify,
        onGroupInfoChangeNotify: this.onGroupInfoChangeNotify,
        groupSystemNotifys: this.groupSystemNotifys
      }
    });
  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {



  },
  //清屏
  clearHandler: function () {
    console.log('清');
    YYTIMServer.clearScreen();
  },
  //锁屏
  lockHandler: function () {
    console.log('锁');
    YYTIMServer.lockScreen();
  },
  //单击某用户发送的消息
  messageClickHandler: function (e) {
    var control, li;
    control = $(e.target).parent();
    if (control.hasClass('controls_forbid_reject')) {
      this.msgControlHandler(e);
    } else {
      li = $(e.target).parents('li');
      this.showMsgControlMenu(li);
    }

  },
  //显示,隐藏禁言/提出按钮
  showMsgControlMenu: function (target) {
    if (target.length <= 0) return;
    var control = target.find('.controls_forbid_reject'),
      index = $('#msg-list li').index(target);

    $('.controls_forbid_reject').not(control).hide();
    if (index === 0) {
      control.css('margin-top', '33px');
    }
    control.toggle();
  },
  //禁言,或者踢出
  msgControlHandler: function (e) {
    var target = $(e.target);
    console.log(target.text());
    if (target.text() === '禁言') {
      YYTIMServer.disableSendMsg();
    } else if (target.text() === '踢出') {
      YYTIMServer.removeUserFromGroup();
    }
  },
  onMsgNotify: function (notifyInfo) {
    console.log('onMsgNotify');

  },
  onGroupInfoChangeNotify: function (notifyInfo) {
    console.log('onGroupInfoChangeNotify');
  },
  groupSystemNotifys: function (notifyInfo) {
    console.log('groupSystemNotifys');
  },
  /**
   * 添加消息
   * @constructor
   */
  AddMessage: function(data) {


  }
});

module.exports = View;