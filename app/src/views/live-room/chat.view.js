/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类

var uiConfirm = require('ui.confirm');
var DateTime = require('BusinessDate');
var FlashAPI = require('FlashApi');
var msgBox = require('ui.msgBox');
var YYTIMServer = require('imServer');
// var RoomDetailModel = require('../../models/anchor/room-detail.model');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var GiftModel = require('../../models/anchor/gift.model');
var UserInfo = require('./user.js');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
// 清屏,锁屏
var RoomManagerView = require('./room-manager.view');

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

    this.giftModel = GiftModel.sharedInstanceModel();
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (ops) {
    this.options = _.extend({}, ops);
    if ($('#broadCastFlash').length > 0) {
      this.flashAPI = FlashAPI.sharedInstanceFlashApi({
        el: 'broadCastFlash'
      });
    }
    this.defineEventInterface();

    this.roomCtrlView = new RoomManagerView({
      roomInfo: this.roomInfo,
      FlashApi: this.flashAPI,
      msgList: this.elements.msgList
    });
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
        if (data.status === 2) {
          self.checkUserCanJoinRoom();
        }
      }
    });

    Backbone.on('event:onMsgNotify', function (notifyInfo) {
      if (_.isArray(notifyInfo)) {
        _.each(notifyInfo, function (item) {
          if (item.hasOwnProperty('msg')) {
            if (item.msg.isSend === false) {
              self.onMsgNotify(item.msg);
            }
          } else if (item.hasOwnProperty('isSend')) {
            if (item.isSend === false) {
              self.onMsgNotify(item);
            }
          }
        });
      } else if (_.isObject(notifyInfo)) {
        if (notifyInfo.isSend === false) {
          self.onMsgNotify(notifyInfo);
        }
      }
    });
    Backbone.on('event:onGroupInfoChangeNotify', function (notifyInfo) {
      self.onGroupInfoChangeNotify(notifyInfo);
    });
    Backbone.on('event:groupSystemNotifys', function (notifyInfo) {
      self.groupSystemNotifys(notifyInfo);
    });

    Backbone.on('event:visitorSendMessage', function (data) {
      if (self.options.type !== 'channel') {
        if (UserInfo.isDisbaleTalk(user.get('userId'), self.roomInfo.id)) {
          msgBox.showTip('您已经被禁言,不能发弹幕哦');
          return null;
        }
        if (UserInfo.isLockScreen(self.roomInfo.id)) {
          msgBox.showTip('主播:进行了锁屏操作');
          return null;
        }
      }
      self.beforeSendMsg(data, function (msgObj) {
        self.sendMsgToGroup(msgObj);
      });
      return null;
    });

    Backbone.on('event:visitorInteractive', function (data) {
      if (UserInfo.isDisbaleTalk(user.get('userId'), self.roomInfo.id)) {
        msgBox.showTip('您已经被主播禁言十分钟.');
      } else {
        self.beforeSendMsg(data, function (msgObj) {
          self.sendMsgToGroup(msgObj);
        });
      }
    });
    Backbone.on('event:forbidUserSendMsg', function (data) {
      self.forbidUserSendMsgHandler(data);
    });
    Backbone.on('event:currentUserInfoReady', function (userInfo) {
      if (userInfo) {
        self.currentUserInfo = userInfo;
      }
    });

    Backbone.on('event:IMGroupInfoReady', function (info) {
      self.currentGroupInfo = info;
    });

    Backbone.on('event:liveShowEnded', function (data) {
      uiConfirm.show({
        title: '直播结束',
        content: '本场直播已经结束,点击确定返回首页.',
        cancelBtn: false,
        okFn: function () {
          window.location.href = '/';
        },
        cancelFn: function () {
          window.location.href = '/';
        }
      });
      self.roomInfo.status = data.roomStatus;
    });
  },

  onMsgNotify: function (notifyInfo) {
    var self = this;
    var msgObj = {};

    // if (notifyInfo && notifyInfo.type == 0 && notifyInfo.elems && notifyInfo.elems.length > 0) {
    if (notifyInfo && notifyInfo.elems && notifyInfo.elems.length > 0) {
      var elem = notifyInfo.elems[0];
      if (elem.type === 'TIMCustomElem') {
        msgObj = elem.content.data;
      } else {
        msgObj = elem.content.text + '';
        // msgObj = msgObj.replace(/&quot;/g, '\'');
        msgObj = msgObj.replace(/[']/g, '').replace(/&quot;/g, '\'');
      }
      try {
        // eval('msgObj = ' + msgObj);
        msgObj = JSON.parse(msgObj);
      } catch (e) {
        console.log(e);
      }
      if (_.isObject(msgObj)) {
        msgObj.fromAccount = notifyInfo.fromAccount;

        self.beforeSendMsg(msgObj, function (msg) {
          self.addMessage(msg);
        });
      }
    }
  },

  beforeSendMsg: function (msg, callback) {
    var self = this;
    var msgObj = msg;
    var tempInfo;
    var isChannel = this.options.type === 'channel';
    var roomId = isChannel ? this.roomInfo.channelId : this.roomInfo.id;

    if (!isChannel) {
      if (msgObj.roomId !== roomId) {
        return;
      }
      if (self.roomInfo && self.roomInfo.status === 3) {
        msgBox.showTip('直播已结束,无法进行互动');
        return;
      }
    }

    switch (msgObj.msgType) {
      case 0: // 文本消息
        msgObj = $.extend(msgObj, {
          userId: user.get('userId')
        });
        callback(msgObj);
        break;
      case 1: // 发送礼物
        var giftName = self.giftModel.findGift(msgObj.giftId).name || '礼物';
        msgObj.content = '<b>' + msgObj.nickName + '</b>向主播赠送' + giftName + '!';
        msgObj.smallAvatar = '';
        callback(msgObj);
        break;
      case 2: // 公告
        Backbone.trigger('event:updateRoomNotice', msgObj);
        break;
      case 3: // 点赞
        msgObj.content = '<b>' + msgObj.nickName + '</b>点赞一次!';
        msgObj.smallAvatar = '';
        callback(msgObj);
        break;
      case 4: //  清屏
        this.elements.msgList.children().remove();
        msgObj.content = '进行了清屏操作!';
        msgObj.smallAvatar = '';
        callback(msgObj);
        tempInfo = {
          roomId: self.roomInfo.id,
          nickName: '主播',
          smallAvatar: '',
          msgType: 4,
          content: '主播已清屏'
        };
        self.flashAPI.onReady(function () {
          this.notifying(tempInfo);
        });
        break;
      case 5: //  禁言
        Backbone.trigger('event:forbidUserSendMsg', msgObj);
        break;
      default:
        break;
    }
  },
  onGroupInfoChangeNotify: function (notifyInfo) {
    var intro;
    var msg;
    var notify;
    if (notifyInfo && notifyInfo.GroupIntroduction) {
      intro = JSON.parse(notifyInfo.GroupIntroduction);
      UserInfo.setLockScreen(this.roomInfo.id, intro.blockState);
      msg = '主播进行了' + (intro.blockState ? '锁屏' : '解屏') + '操作';
      msgBox.showTip(msg);
      Backbone.trigger('event:LockScreen', intro.blockState);
    }
    if (notifyInfo && notifyInfo.GroupNotification) {
      notify = JSON.parse(notifyInfo.GroupNotification);
      notify.isEvent = true;
      Backbone.trigger('event:UserKickOut', notify);
    }
  },
  groupSystemNotifys: function () {},
  /**
   * 获取消息模板
   * @returns {*}
   */
  getMessageTpl: function () {
    return require('../anchor/template/chat-message-tpl.html');
  },
  sendMsgToGroup: function (msgObj) {
    this.addMessage(msgObj);

    YYTIMServer.sendMessage({
      groupId: this.roomInfo.imGroupid,
      msg: msgObj
    });
    this.autoDeleteMsgList();
  },
  addMessage: function (msg) {
    var self = this;
    var msgObj;
    var roomId = this.options.type === 'channel' ? this.roomInfo.channelId : this.roomInfo.id;
    msgObj = _.extend({
      nickName: '匿名',
      content: '',
      smallAvatar: '',
      time: self.getDateStr(new Date()),
      fromAccount: '',
      userId: ''
    }, msg);

    if (msgObj && msgObj.roomId !== roomId) {
      return;
    }
    msgObj.content = self.filterEmoji(msgObj.content);
    if (msgObj && msgObj.content) {
      var tpl = _.template(this.getMessageTpl());
      this.elements.msgList.append(tpl(msgObj));
      this.elements.chatHistory.scrollTop(this.elements.msgList.height());
      // if (msgObj.msgType == 0) {
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
    var reg = /[\u4e00-\u9fa5\w\d@\.\-,\+\?，。（）!#【】！~“：《》？<>]/g;
    if (content) {
      var result = content.match(reg) || [];
      if (result.length > 0) {
        return result.join('') || '';
      }
      return '';
    }
    return content;
  },
  // 动删除前面的,仅留下500条
  autoDeleteMsgList: function () {
    var total = this.elements.msgList.children().length;
    var index = 0;
    if (total > 500) {
      index = total - 200;
    }
    this.elements.msgList.children(':lt(' + index + ')').remove();
  },
  // 转换时间格式
  getDateStr: function (dateInt) {
    var date = new Date(dateInt);
    return DateTime.format(date, 'hh:mm:ss');
  },
  checkUserCanJoinRoom: function () {
    var info;
    YYTIMServer.getGroupInfo(this.roomInfo.imGroupid, function (res) {
      if (res && ~~res.ErrorCode === 0 || res.GroupInfo[0]) {
        info = res.GroupInfo[0];
        console.log(info);
      }
    }, function () {});
  },
  checkUserStatus: function () {
    if (UserInfo.isDisbaleTalk(user.get('userId'), self.roomInfo.id)) {
      msgBox.showTip('您已经被禁言,不能发弹幕哦');
      return false;
    }

    return false;
  },
  forbidUserSendMsgHandler: function (notifyInfo) {
    var imIdentifier = imModel.$get('data.imIdentifier');
    if (notifyInfo.userId === imIdentifier) {
      msgBox.showTip('您已被主播禁言10分钟!');
      Backbone.trigger('event:currentUserDisableTalk', true);
      var cur = new Date();
      UserInfo.setDisableTalk(user.get('userId'), this.roomInfo.id, cur.getTime() + 10 * 60 * 1000);
    }
  }
});

module.exports = View;
