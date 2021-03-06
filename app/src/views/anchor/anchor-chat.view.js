/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */

/**
 * @time 2016-3-11
 * @author YuanXuJia
 * @info 聊天控制
 */

var _ = require('underscore');
var Backbone = window.Backbone;
var webim = window.webim;

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
var UserInfo = require('../live-room/user.js');
// 清屏,锁屏
var RoomControlView = require('./room-control.view');

var View = BaseView.extend({
  el: '#anchorCtrlChat', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/chat.html');
  },
  events: { // 监听事件
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
    this.imgClear = el.find('#imgClear');
    this.imgUnLock = el.find('#imgUnLock');

    this.imgClear.attr('src', '/images/clear.png');
    this.imgUnLock.attr('src', '/images/clock.png');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (ops) {
    this.defineEventInterface();
    this.options = _.extend({}, ops);
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
        self.roomInfoReady();
      }
    });
    this.FlashApi = FlashApi.sharedInstanceFlashApi({
      el: 'broadCastFlash'
    });
    this.roomCtrlView = new RoomControlView(_.extend({
      roomInfo: this.roomInfo,
      FlashApi: this.FlashApi,
      msgList: this.msgList
    }, this.options));
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
      if (~~li.attr('data-msgType') === 0) {
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
      control.css('margin-top', control.find('a').height());
    }
    if (this.options.assistant) {
      control.find('.ctrl').hide();
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

    var text = target.text();

    if (text === '禁言') {
      this.disableSendMsgConfirm(userInfo);
    } else if (text === '踢出') {
      this.removeUserFromRoom(userInfo);
    } else if (text === '场控') {
      Backbone.trigger('event:addUserToManager', {
        userId: target.attr('data-uid'),
        userName: target.attr('data-name')
      });
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
        userId: userInfo.id,
        toUsername: userInfo.name,
        nickName: self.options.assistant ? '场控' : '主播',
        content: (self.options.assistant ? '场控' : '主播') + '将用户' + userInfo.name + '禁言'
      }
    }, function () {
      msgBox.showOK('已将用户:<b>' + userInfo.name + ' 禁言10分钟.');
      self.FlashApi.onReady(function () {
        this.notifying({
          roomId: self.roomInfo.id,
          userId: userInfo.id,
          nickName: '消息',
          msgType: 0,
          style: {
            fontColor: '#999999'
          },
          content: (self.options.assistant ? '场控' : '主播') + '将用户' + userInfo.name + '禁言'
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
    var msg = {
      roomId: self.roomInfo.id,
      nickName: self.options.assistant ? '场控' : '主播',
      smallAvatar: '',
      msgType: 10, // 踢人
      toUser: data.id,
      toUsername: data.name,
      content: (self.options.assistant ? '场控' : '主播') + '将用户' + data.name + '踢出房间'
    };


    function okCallback() {
      if (self.forbidUsers.length > 200) {
        self.forbidUsers.shift();
      }
      self.forbidUsers.push(data.id);
      var options = {
        GroupId: self.roomInfo.imGroupid,
        Notification: JSON.stringify({
          forbidUsers: self.forbidUsers
        })
      };

      imServer.modifyGroupInfo(options, function (result) {
        if (result && result.ActionStatus === 'OK') {
          msgBox.showOK('成功将用户:<b>' + data.name + '</b>踢出房间');
          imServer.sendMessage({
            groupId: self.roomInfo.imGroupid,
            msg: msg
          });
        } else {
          msgBox.showError('将用户:<b>' + data.name + '</b>踢出房间失败,请稍后再试');
        }
      }, function () {
        msgBox.showError('将用户:<b>' + data.name + '</b>踢出房间失败,请稍后再试');
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
    var elems;
    var elem;
    var type;
    var content;
    elems = notifyInfo.getElems(); // 获取消息包含的元素数组
    for (var i = 0, j = elems.length; i < j; i++) {
      elem = elems[i];
      type = elem.getType(); // 获取元素类型
      content = elem.getContent(); // 获取元素对象
      switch (type) {
        case webim.MSG_ELEMENT_TYPE.TEXT:
          this.parseMsgToChatList(content.text.replace(/&quot;/g, '"'), notifyInfo);
          break;
        case webim.MSG_ELEMENT_TYPE.FACE:
          break;
        case webim.MSG_ELEMENT_TYPE.IMAGE:
          break;
        case webim.MSG_ELEMENT_TYPE.SOUND:
          break;
        case webim.MSG_ELEMENT_TYPE.FILE:
          break;
        case webim.MSG_ELEMENT_TYPE.CUSTOM:
          this.parseMsgToChatList(content.data, notifyInfo);
          break;
        case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
          break;
        default:
          webim.Log.error('未知消息元素类型: elemType=' + type);
          break;
      }
    }
  },
  parseMsgToChatList: function (content, msg) {
    var msgObj;
    var giftName;
    var self = this;
    try {
      msgObj = JSON.parse(content);
    } catch (e) {
      console.log(e);
    }
    if (!_.isObject(msgObj)) {
      return;
    }
    msgObj.fromAccount = msg.fromAccount;
    var date = new Date(msg.getTime() * 1000);
    msgObj.time = BusinessDate.format(date, 'hh:mm:ss');
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
        $('#noticeWrap').text(msgObj.content || '暂无公告');
        break;
      case 3: // 点赞
        msgObj.content = '<b>' + msgObj.nickName + '</b>点赞一次!';
        msgObj.nickName = '消息';
        msgObj.smallAvatar = '';
        self.addMessage(msgObj);
        break;
      case 4: //  清屏
        if (!msgObj.content) {
          msgObj.content = '管理员进行了清屏操作!';
          msgObj.nickName = '消息';
        }
        self.addMessage(msgObj);
        self.FlashApi.onReady(function () {
          this.notifying(msgObj);
        });
        break;
        // 禁言
      case 5:
        if (!msgObj.content) {
          msgObj.content = msgObj.toUsername + '已被禁言十分钟!';
        }
        self.addMessage(msgObj);
        break;
      case 8:
        msgObj.content = '管理员已锁屏';
        $('#btn-lock').find('span').text(msgObj.msgType === 8 ? '解屏' : '锁屏');
        self.lockOrUnlock(true);
        self.addMessage(msgObj);
        break;
      case 9:
        $('#btn-lock').find('span').text(msgObj.msgType === 9 ? '锁屏' : '解屏');
        self.lockOrUnlock(false);
        msgObj.content = '管理员已解屏';
        self.addMessage(msgObj);
        break;
      case 10:
        if (!msgObj.content) {
          msgObj.content = msgObj.toUsername + '已被管理员踢出!';
        }
        self.addMessage(msgObj);
        break;
      case 11:
        self.handleController(msgObj);
        break;
      default:
        break;
    }
  },
  initGiftList: function () {
    this.giftModel.get(this.giftParams, function () {}, function (err) {
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
      nickName: '',
      content: '',
      smallAvatar: '',
      userId: ''
    }, {
      time: BusinessDate.format(new Date, 'hh:mm:ss'),
      fromAccount: ''
    }, msgObj);
    if (msgObj && parseInt(msgObj.roomId, 0) !== parseInt(self.roomInfo.id, 0)) {
      return;
    }
    msgObj.content = self.filterEmoji(msgObj.content);
    if (msgObj && msgObj.content) {
      tpl = _.template(this.getMessageTpl());
      this.msgList.append(tpl(msgObj));
      this.chatHistory.scrollTop(this.msgList.height());
      if (msg.msgType === 5) {
        msgObj.msgType = 0;
        msgObj.style = {
          fontColor: '#999999'
        };
      }
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
          if (!item.getIsSend()) {
            self.onMsgNotify(item);
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

    Backbone.on('event:clearAllScreen', function (msg) {
      self.addMessage(msg);
    });

    Backbone.on('event:LockOrUnLock', function (msg) {
      self.addMessage(msg);
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
  getMessageFromServer: function () {},
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
            $('#btn-lock').children('span').text('解屏');
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
  },
  handleController: function (msgObj) {
    var self = this;
    var userId = user.get('userId');
    if (msgObj.toUser && msgObj.roomControl) {
      if (msgObj.toUser === '' + userId) {
        if (msgObj.roomControl === 'true') {
          msgBox.showTipTime('主播将您设置为场控，5秒后将转到场控页面!', 5000);
        } else if (msgObj.roomControl === 'false') {
          msgBox.showTipTime('主播已移除您的场控权限，5秒后将返回聊天室页面!', 5000);
        }
        setTimeout(function () {
          if (msgObj.roomControl === 'true') {
            // window.location.reload();
            window.location.href = '/assistant.html?roomId=' + self.roomInfo.id;
          } else if (msgObj.roomControl === 'false') {
            window.location.href = '/liveroom.html?roomId=' + self.roomInfo.id;
          }
        }, 5000);
      }
    }
  },
  lockOrUnlock: function (isLock) {
    UserInfo.setLockScreen(this.roomInfo.id, isLock);
    var msg = '主播进行了' + (isLock ? '锁屏' : '解屏') + '操作';
    msgBox.showTip(msg);
    Backbone.trigger('event:LockScreen', isLock);
  }
});

module.exports = View;
