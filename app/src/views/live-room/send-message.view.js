/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var msgBox = require('ui.msgBox');
var Backbone = window.Backbone;
var _ = require('underscore');


var View = BaseView.extend({
  el: '#sendMessageWrap', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/send-message.html');
  },
  events: { // 监听事件
    'click #btnChooseColor': 'showColorPanel',
    'click #colorList': 'chooseColor',
    'click #btnSendMsg': 'sendMsgClick',
    'keyup #txtMessage': 'textMsgChanged'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.elements = {};
    this.speekPeriod = 5 * 1000;
    this.canSendNow = true;
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    var el = this.$el;

    this.elements = {
      btnChooseColor: el.find('#btnChooseColor'),
      colorList: el.find('#colorList'),
      chooseColorPanel: el.find('#chooseColorPanel'),
      txtMessage: el.find('#txtMessage'),
      limitTip: el.find('#limitTip')
    };
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (ops) {
    this.options = _.extend({}, ops);
    this.defineEventInterface();
    this.setTextAreatColor();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
      }
    });
    Backbone.on('event:visitorSendGift', function (data) {
      var id = self.options.type === 'channel' ? self.roomInfo.channelId : self.roomInfo.id;
      self.sendMessageToChat(_.extend({
        nickName: user.get('userName'),
        smallAvatar: user.get('bigheadImg'),
        roomId: id
      }, data));
    });
  },
  showColorPanel: function () {
    this.elements.btnChooseColor.toggleClass('actived');

    this.elements.chooseColorPanel.toggle();
  },
  chooseColor: function (e) {
    var target = $(e.target);
    var color = target.data('color');
    this.setTextAreatColor(color);
    this.showColorPanel();
  },
  setTextAreatColor: function (color) {
    this.elements.btnChooseColor.attr('data-color', color);
    this.elements.txtMessage.css('color', color || '#999999');
  },
  sendMsgClick: function () {
    var self = this;
    var len = $.trim(this.elements.txtMessage.val()).length;
    if (len < 1) {
      return '';
    }
    if (len > 20) {
      msgBox.showTip('发言文字已经超过20个字!');
      return '';
    }
    if (!this.canSendNow) {
      msgBox.showTip('请发言不要太频繁!');
      return null;
    }
    this.canSendNow = false;
    var msg = {
      msgType: 0,
      content: $.trim(this.elements.txtMessage.val()),
      nickName: user.get('userName'),
      style: {
        fontColor: this.elements.btnChooseColor.attr('data-color') || '#999999'
      },
      smallAvatar: user.get('bigheadImg'),
      roomId: this.roomInfo.id,
      time: ''
    };
    // 处理频道发言
    if (this.options.type === 'channel') {
      msg.channelId = this.options.channelId;
      msg.roomId = -1;
    }
    this.sendMessageToChat(msg);
    this.elements.txtMessage.val('');
    this.elements.limitTip.text(20);
    setTimeout(function () {
      self.canSendNow = true;
    }, self.speekPeriod);
    return null;
  },
  sendMessageToChat: function (msg) {
    if (this.options.type !== 'channel') {
      if (!this.roomInfo || this.roomInfo.status !== 2) {
        msgBox.showTip('该直播不在直播中,无法进行互动');
        this.elements.txtMessage.val('');
        return;
      }
    }
    Backbone.trigger('event:visitorSendMessage', msg);
  },
  textMsgChanged: function (e) {
    if (e && e.keyCode === 13) {
      this.sendMsgClick();
      return false;
    }
    var len = $.trim(this.elements.txtMessage.val().length);
    this.elements.limitTip.text(20 - len);
    if (len >= 20) {
      return false;
    }
    return true;
  }
});

module.exports = View;
