/**
 * im 群组管理 -禁言，提出,场控
 */

'use strict';

var $ = require('jquery');

var imServer = require('imServer');
var uiConfirm = require('ui.confirm');
var msgBox = require('ui.msgBox');
// var UserModel = require('UserModel');
// var user = UserModel.sharedInstanceUserModel();

/**
 * ops = {
  }
 */

var View = function (ops) {
  this.options = $.extend({}, ops);
};

View.prototype = $.extend(View.prototype, {
  setOptions: function (ops) {
    this.options = $.extend(this.options, ops);
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
    if (this.options.isAssistant) {
      control.find('.ctrl').hide();
    }
    var index = $('#msgList').find('li').index(target);
    if (target.length <= 0) return;

    $('.controls_forbid_reject').not(control).hide();
    if (index === 0) {
      control.css('margin-top', control.find('a').height);
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
  }
});

module.exports = View;
