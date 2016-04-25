/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */

/**
 * @time 2016-3-11
 * @author YuanXuJia
 * @info 聊天控制
 */

var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var imServer = require('imServer');
var uiConfirm = require('ui.confirm');
var BusinessDate = require('BusinessDate');
var FlashApi = require('FlashApi');
var RoomDetailModel = require('../../models/anchor/room-detail.model');
var GiftModel = require('../../models/anchor/gift.model');
var msgBox = require('ui.msgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var _ = require('underscore');
var Backbone = require('backbone');

var View = BaseView.extend({
  el: '#anchorCtrlChat', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/chat.html');
  },
  events: { // 监听事件
    'click #btn-clear': 'clearHandler',
    'click #btn-lock': 'lockClickHandler',
    'click #msgList': 'messageClickHandler'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    // 禁言用户列表
    this.forbidUsers = [];

    this.giftModel = GiftModel.sharedInstanceModel();
    this.giftParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      offset: 0,
      size: 90000,
      type: 0
    };

    this.roomDetail = RoomDetailModel.sharedInstanceModel();
    this.roomInfo = this.roomDetail.get('data') || {};

    this.initGiftList();
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    var el = this.$el;
    this.msgList = el.find('#msgList');
    this.chatHistory = el.find('#chatHistory');
    this.btnLock = el.find('#btn-lock');
    this.defineEventInterface();
    this.imgClear = el.find('#imgClear');
    this.imgUnLock = el.find('#imgUnLock');

    this.imgClear.attr('src', '/images/clear.png');
    this.imgUnLock.attr('src', '/images/clock.png');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.roomInfoReady();
    this.FlashApi = FlashApi.sharedInstanceFlashApi({
      el: 'broadCastFlash'
    });
  },
  // 清屏
  clearHandler: function () {
    var self = this;
    var flag = self.checkLiveRoomReady();
    if (!flag) {
      return;
    }

    uiConfirm.show({
      content: '您确定要清屏吗?',
      okFn: function () {
        var msg = {
          roomId: self.roomInfo.id,
          nickName: '主播',
          smallAvatar: '',
          msgType: 4,
          content: '主播已清屏'
        };
        self.FlashApi.onReady(function () {
          this.notifying(msg);
        });
        imServer.clearScreen({
          groupId: self.roomInfo.imGroupid,
          msg: msg
        });
      }
    });
  },
  // 锁屏
  lockClickHandler: function () {
    var flag = this.checkLiveRoomReady();
    var target = this.btnLock.children('span');
    var self = this;
    var txt = target.text() === '锁屏' ? '锁定屏幕' : '解开屏幕';
    if (!flag) {
      return;
    }
    uiConfirm.show({
      content: '您确定要' + txt + '吗?',
      okFn: function () {
        self.lockIMHandler(target.text() === '锁屏');
      }
    });
  },
  lockIMHandler: function (isLock) {
    var self = this;
    var options = {
      GroupId: this.roomInfo.imGroupid
    };
    var txt = isLock === true ? '锁屏' : '解屏';

    if (isLock === true) {
      options.Introduction = JSON.stringify({
        blockState: !!isLock,
        alert: '主播已锁屏'
      });
    } else {
      options.Introduction = JSON.stringify({
        blockState: false,
        alert: '主播解除锁屏'
      });
    }

    imServer.modifyGroupInfo(options, function (result) {
      if (result && result.ActionStatus === 'OK') {
        self.btnLock.children('span').text(isLock === true ? '解屏' : '锁屏');
        msgBox.showOK(txt + '成功!');
      } else {
        msgBox.showError(txt + '操作失败,请稍后重试');
      }
    }, function () {
      msgBox.showError(txt + '操作失败,请稍后重试');
    });
  },
  // 清空消息
  clearMessageList: function () {
    this.msgList.children().remove();
  },
  // 单击某用户发送的消息
  messageClickHandler: function (e) {
    var control;
    var li;
    control = $(e.target).parent();
    if (control.hasClass('controls_forbid_reject')) {
      this.msgControlHandler(e);
    } else {
      li = $(e.target).parents('li');
      // 确认是文本消息
      if (li.attr('data-msgType') === 0) {
        this.showMsgControlMenu(li);
      }
    }
  },
  // 显示,隐藏禁言/踢出按钮
  showMsgControlMenu: function (target) {
    var control = target.find('.controls_forbid_reject');
    var index = $('#msgList').find('li').index(target);
    if (target.length <= 0) return;

    $('.controls_forbid_reject').not(control).hide();
    if (index === 0) {
      control.css('margin-top', '33px');
    }
    control.toggle();
  },
  // 禁言,或者踢出
  msgControlHandler: function (e) {
    var target = $(e.target);
    var li;
    var userInfo = {};

    li = target.parents('li');
    userInfo = {
      name: li.attr('data-name'),
      id: li.attr('data-id')
    };

    if (target.text() === '禁言') {
      this.disableSendMsgConfirm(userInfo);
    } else if (target.text() === '踢出') {
      this.removeUserFromRoom(userInfo);
    }
  },
  /**
   * 禁止用户发言确认提示框
   */
  disableSendMsgConfirm: function (userInfo) {
    var self = this;
    uiConfirm.show({
      content: '您确定要禁止用户:<b>' + userInfo.name + '</b>发言吗?',
      okFn: function () {
        self.disableSendMsgHandler(userInfo);
      }
    });
  },
  disableSendMsgHandler: function (userInfo) {
    var self = this;
    var users = [];
    users.push(userInfo.id);
    imServer.sendMessage({
      groupId: self.roomInfo.imGroupid,
      msg: {
        roomId: self.roomInfo.id,
        msgType: 5,
        userId: userInfo.id
      }
    }, function () {
      msgBox.showOK('已将用户:<b>' + userInfo.name + ' 禁言10分钟.');
      self.FlashApi.onReady(function () {
        this.notifying({
          roomId: self.roomInfo.id,
          userId: userInfo.id,
          nickName: userInfo.name,
          msgType: 5
        });
      });
    }, function () {
      msgBox.showError('禁言失败,请稍后重试!');
    });
  },
  hideUserControl: function () {
    $('.controls_forbid_reject').hide();
  },
  /**
   * 将用户从房间中移除
   */
  removeUserFromRoom: function (data) {
    var self = this;

    function okCallback() {
      var options = {
        GroupId: self.roomInfo.imGroupid,
        Notification: JSON.stringify({
          forbidUsers: self.forbidUsers
        })
      };
      if (self.forbidUsers.length > 200) {
        self.forbidUsers.shift();
      }
      self.forbidUsers.push(data.id);

      imServer.modifyGroupInfo(options, function (result) {
        if (result && result.ActionStatus === 'OK') {
          msgBox.showOK('成功将用户:<b>' + data.name + '</b>踢出房间');
        } else {
          msgBox.showError('将用户:<b>' + data.name + '</b>踢出房间失败,请稍后再试');
        }
      });
    }

    uiConfirm.show({
      content: '您确定要将用户:<b>' + data.name + '</b>踢出房间吗?',
      okFn: function () {
        okCallback();
      }
    });
  },
  // 腾讯IM消息到达回调
  onMsgNotify: function (notifyInfo) {
    var self = this;
    var msgObj = {};
    var elem;
    var giftName;

    if (notifyInfo && notifyInfo.type === 0 && notifyInfo.elems && notifyInfo.elems.length > 0) {
      elem = notifyInfo.elems[0];
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
      if (!_.isObject(msgObj)) {
        return;
      }
      msgObj.fromAccount = notifyInfo.fromAccount;

      switch (msgObj.msgType) {
        case 0: // 文本消息
          self.addMessage(msgObj);
          break;
        case 1: // 发送礼物
          giftName = self.giftModel.findGift(msgObj.giftId).name || '礼物';
          msgObj.content = '<b>' + msgObj.nickName + '</b>发来' + giftName + '!';
          msgObj.nickName = '消息';
          msgObj.smallAvatar = '';
          self.addMessage(msgObj);
          break;
        case 2: // 公告
          break;
        case 3: // 点赞
          msgObj.content = '<b>' + msgObj.nickName + '</b>点赞一次!';
          msgObj.nickName = '消息';
          msgObj.smallAvatar = '';
          self.addMessage(msgObj);
          break;
        case 4: //  清屏
          break;
        default:
          break;
      }
    }
  },
  initGiftList: function () {
    this.giftModel.get(this.giftParams, function () {
    }, function (err) {
      console.log(err);
    });
  },
  onGroupInfoChangeNotify: function (notifyInfo) {
    console.log(notifyInfo);
  },
  groupSystemNotifys: function (notifyInfo) {
    console.log(notifyInfo);
  },
  /**
   * 获取消息模板
   * @returns {*}
   */
  getMessageTpl: function () {
    return require('./template/chat-message-tpl.html');
  },
  /**
   * 添加消息
   * @constructor
   */
  addMessage: function (msg) {
    var self = this;
    var msgObj = msg;
    var tpl;
    msgObj = _.extend({
      nickName: '匿名',
      content: '',
      smallAvatar: '',
      time: self.getDateStr(new Date())
    }, msgObj);

    if (msgObj && msgObj.roomId !== self.roomInfo.id) {
      return;
    }
    msgObj.content = self.filterEmoji(msgObj.content);
    if (msgObj && msgObj.content) {
      tpl = _.template(this.getMessageTpl());
      this.msgList.append(tpl(msgObj));
      this.chatHistory.scrollTop(this.msgList.height());
      this.FlashApi.onReady(function () {
        this.notifying(msgObj);
      });
    }
    self.autoDeleteMsgList();
  },
  /**
   * 过滤表情
   * @param  {[type]} content [description]
   * @return {[type]}         [description]
   */
  filterEmoji: function (content) {
    var reg = /[\u4e00-\u9fa5\w\d@\.\-。_!^^+#【】！~“：《》？<>]/g;
    var result;
    if (content) {
      result = content.match(reg) || [];
      if (result.length > 0) {
        return result.join('') || '';
      }
      return '';
    }
    return content;
  },
  // 当消息条数超过1000自动删除前面的,仅留下500条
  autoDeleteMsgList: function () {
    var total = this.msgList.children().length;
    var index = 0;
    if (total > 1000) {
      index = total - 500;
    }
    this.msgList.children(':lt(' + index + ')').remove();
  },
  /**
   * 定义对外公布的事件
   */
  defineEventInterface: function () {
    var self = this;

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
      // if (notifyInfo && notifyInfo.constructor.name === 'Array') {
      //     for (var i = 0, len = notifyInfo.length; i < len; i++) {
      //         self.onMsgNotify(notifyInfo[i]);
      //     }
      // } else {
      //     self.onMsgNotify(notifyInfo);
      // }
    });
    Backbone.on('event:onGroupInfoChangeNotify', function (notifyInfo) {
      self.onGroupInfoChangeNotify(notifyInfo);
    });
    Backbone.on('event:groupSystemNotifys', function (notifyInfo) {
      self.groupSystemNotifys(notifyInfo);
    });
  },
  /**
   *
   */
  roomInfoReady: function () {
    this.getGroupInfo();
  },
  /**
   * 从服务器端拉去消息
   */
  getMessageFromServer: function () {
  },
  /**
   * 获取群组公告以及介绍
   */
  getGroupInfo: function () {
    var self = this;
    var intro;

    imServer.getGroupInfo(self.roomInfo.imGroupid, function (result) {
      if (result && result.ActionStatus === 'OK') {
        if (result.GroupInfo && result.GroupInfo[0] && result.GroupInfo[0].Introduction) {
          intro = JSON.parse(result.GroupInfo[0].Introduction);
          if (intro && intro.blockState === true) {
            self.btnLock.children('span').text('解屏');
          }
        }
      }
    }, function (err) {
      msgBox.showError(err.msg || '获取群组消息失败!');
    });
  },
  // 转换时间格式
  getDateStr: function (dateInt) {
    var date = new Date(dateInt);
    return BusinessDate.format(date, 'hh:mm:ss');
  },
  // 检查当前直播状态
  checkLiveRoomReady: function () {
    switch (this.roomInfo.status) {
      case 0:
        msgBox.showTip('该直播尚未发布!');
        return false;
      case 1:
      case 2:
        if (!this.roomInfo || !this.roomInfo.imGroupid) {
          msgBox.showTip('请先开始直播!');
          return false;
        }
        return true;
      case 3:
        msgBox.showTip('该直播已经结束!');
        return false;
      default:
        return false;
    }
  }
});

module.exports = View;
