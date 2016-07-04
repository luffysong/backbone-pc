/**
 * 房间控制
 * 清屏, 锁屏,场控管理
 */
'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;

var FieldControlView = require('./room-manager.view');

var imServer = require('imServer');
var uiConfirm = require('ui.confirm');
var msgBox = require('ui.msgBox');
var uiDialog = require('ui.Dialog');


var View = BaseView.extend({
  el: '.room-control',
  rawLoader: function () {
    return require('./template/room-control.html');
  },
  events: {
    'click #btn-clear': 'clearHandler',
    'click #btn-lock': 'lockClickHandler',
    'click #btnFieldControl': 'fieldContrlClickHandler'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    var el = this.$el;
    this.btnLock = el.find('#btn-lock');
    this.btnFieldControl = el.find('#btnFieldControl');
  },
  ready: function (ops) {
    //  初始化
    this.roomInfo = ops.roomInfo || {};
    this.FlashApi = ops.FlashApi || {};
    this.msgList = ops.msgList || {};
    this.assistant = ops.assistant || false;
    if (ops.hideCtrl) {
      this.btnFieldControl.hide();
    }
    this.defineEventInterface();
    this.fieldControlView = new FieldControlView({
      roomInfo: this.roomInfo
    });
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:showFieldControllDialog', function () {
      self.fieldContrlClickHandler();
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
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
  // 锁屏
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
          nickName: self.assistant ? '场控' : '主播',
          smallAvatar: '',
          msgType: 4,
          content: '进行了清屏操作'
          // content: (self.assistant ? '场控' : '主播') + '已清屏'
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

    var msg = {
      roomId: self.roomInfo.id,
      nickName: self.assistant ? '场控' : '主播',
      smallAvatar: '',
      msgType: 5,
      content: (self.assistant ? '场控' : '主播') + '已' + txt,
      isLock: isLock
    };
    // self.FlashApi.onReady(function () {
    //   this.notifying(msg);
    // });
    imServer.sendMessage({
      groupId: self.roomInfo.imGroupid,
      msg: msg
    });

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
    if (this.msgList) {
      this.msgList.children().remove();
    }
  },
  // 场控管理
  fieldContrlClickHandler: function () {
    var tpl = require('./template/field-control.html');
    if (!this.fieldControlDialog) {
      this.fieldControlDialog = uiDialog.classInstanceDialog(tpl, {
        closeClass: 'editor_bg_close_x', // 'icons am-yyt-close close-white',
        width: 560,
        height: 335,
        isRemoveAfterHide: false
      });
    }
    this.fieldControlDialog.show();
    this.fieldControlView.renderPage();
  }
});

module.exports = View;
