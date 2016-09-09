/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var _ = require('underscore');
var Backbone = window.Backbone;
var webim = window.webim;
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var YYTIMServer = require('imServer');
var BusinessDate = require('BusinessDate');
var FlashAPI = require('FlashApi');
var View = BaseView.extend({
  el: '#anchorCtrlChat', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/chat.html');
  },
  events: { // 监听事件
    // 'click #msgList': 'msgListClicked'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.elements = {};
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    var el = this.$el;
    this.elements = {
      msgList: el.find('#msgList'),
      chatHistory: el.find('#chatHistory')
    };
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (ops) {
    this.options = _.extend({}, ops);
    this.defineEventInterface();
    this.flashAPI = FlashAPI.sharedInstanceFlashApi({
      el: '#broadCastFlash'
    });
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
      }
    });
    Backbone.on('event:playbackVisitorSendMessage', function (data) {
      self.sendMsgToGroup(data);
      return null;
    });
    Backbone.on('event:playbackOnMsgNotify', function (notifyInfo) {
      if (_.isArray(notifyInfo)) {
        _.each(notifyInfo, function (item) {
          if (item.hasOwnProperty('msg')) {
            if (item.msg.isSend === false) {
              self.playBackOnMsgNotify(item);
            }
          } else if (item.hasOwnProperty('isSend')) {
            if (item.isSend === false) {
              self.playBackOnMsgNotify(item);
            }
          }
        });
      } else if (_.isObject(notifyInfo)) {
        if (notifyInfo.isSend === false) {
          self.playBackOnMsgNotify(notifyInfo);
        }
      }
    });
  },
  playBackOnMsgNotify: function (notifyInfo) {
    var self = this;
    var msgObj = {};

    var elems = notifyInfo.getElems(); // 获取消息包含的元素数组
    for (var i = 0, j = elems.length; i < j; i++) {
      var elem = notifyInfo.elems[0];
      var type = elem.getType(); // 获取元素类型
      if (type === webim.MSG_ELEMENT_TYPE.CUSTOM) {
        msgObj = elem.getContent().data;
      } else if (type === 'TIMGroupTipElem') {
        msgObj = elem.content.data;
      } else {
        msgObj = elem.content.text + '';
        msgObj = msgObj.replace(/[']/g, '').replace(/&quot;/g, '\'');
      }
      try {
        if (_.isString(msgObj)) {
          msgObj = JSON.parse(msgObj);
        }
      } catch (e) {
        console.log(e);
      }
      if (_.isObject(msgObj)) {
        msgObj.fromAccount = notifyInfo.fromAccount;
        var date = new Date(notifyInfo.getTime() * 1000);
        msgObj.time = BusinessDate.format(date, 'hh:mm:ss');
        // 添加到消息列表
        self.addMessage(msgObj);
      }
    }
  },
  getMessageTpl: function () {
    return require('../anchor/template/chat-message-tpl.html');
  },
  sendMsgToGroup: function (msgObj) {
    var res = _.extend(msgObj, {
      time: BusinessDate.format(new Date(), 'hh:mm:ss')
    });
    this.addMessage(res);
    YYTIMServer.sendMessage({
      groupId: this.roomInfo.imGroupid,
      msg: msgObj
    });
    this.autoDeleteMsgList();
  },
  addMessage: function (msg) {
    if (this.roomInfo.id !== msg.roomId) {
      return;
    }
    var self = this;
    var msgObj;
    msgObj = _.extend({
      nickName: '匿名',
      content: '',
      smallAvatar: '',
      // time: self.getDateStr(new Date()),
      fromAccount: '',
      userId: ''
    }, msg);

    msgObj.content = self.filterEmoji(msgObj.content);
    if (msgObj && msgObj.content) {
      var tpl = _.template(this.getMessageTpl());
      this.elements.msgList.append(tpl(msgObj));
      this.elements.chatHistory.scrollTop(this.elements.msgList.height());
      try {
        this.flashAPI.onReady(function () {
          this.notifying(msgObj);
        });
      } catch (e) {
        console.log(e);
      }
    }
    self.autoDeleteMsgList();
  },
  filterEmoji: function (content) {
    var reg = /[\u4e00-\u9fa5\w\s\d@\.\-,\+\?，。（）!#【】！~“：《》？<>]/g;
    if (content) {
      var result = content.match(reg) || [];
      if (result.length > 0) {
        return result.join('') || '';
      }
      return '';
    }
    return content;
  },
  autoDeleteMsgList: function () {
    var total = this.elements.msgList.children().length;
    var index = 0;
    if (total > 500) {
      index = total - 200;
    }
    this.elements.msgList.children(':lt(' + index + ')').remove();
  }
});

module.exports = View;
