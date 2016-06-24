/**
 * 顶上去按钮
 */
'use strict';

var $ = require('jquery');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var UserInfo = require('./user.js');

var uiConfirm = require('ui.confirm');
var PopularityModel = require('../../models/live-room/popularity-add.model');
var msgBox = require('ui.msgBox');

/**
 * ops = {
     totalMarks: 总积分,
     roomId: 房间编号
     okFn: function(){}
     errFn: function(){}
   }
 */
var View = function (ops) {
  this.options = $.extend({}, ops);
  this.popularityModel = PopularityModel.sharedInstanceModel();
  this.popularityParams = {
    deviceinfo: '{"aid": "30001001"}',
    access_token: user.getWebToken(),
    type: 1,
    roomId: 0
  };
  this.isNeedPopup = true;
  this.getUserInfo();
};

View.prototype = $.extend({
  setOptions: function (ops) {
    this.options = $.extend(this.options, ops);
  },
  /**
   * 按钮点击
   */
  topClick: function () {
    var self = this;
    if (!this.isNeedPopup) {
      self.pushPopularity(2);
      return;
    }
    var content = '<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">' +
      (this.options.totalMarks || 0) + '</span>积分</div></br>' +
      '<div style="text-align:right; color:#999;"> <label>' +
      '<input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
    uiConfirm.show({
      title: '顶一下',
      content: content,
      okFn: function () {
        self.pushPopularity(2);
        var check = $('#popupCheckBox');
        if (check.is(':checked')) {
          self.isNeedPopup = false;
        } else {
          self.isNeedPopup = true;
        }
      }
    });
  },
  pushPopularity: function (type) {
    var self = this;
    this.popularityParams.type = type;
    this.popularityParams.roomId = this.options.roomId;
    var promise = this.popularityModel.executeJSONP(this.popularityParams);
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS' && res.data.success) {
        if (self.options.okFn) {
          self.options.okFn(res);
        }
      } else {
        msgBox.showTip(res.data.message || '操作失败请您稍后重试');
        if (self.options.errFn) {
          self.options.errFn();
        }
      }
    });
  },
  getUserInfo: function () {
    var self = this;
    UserInfo.getInfo(function (userInfo) {
      self.options.totalMarks = userInfo.totalMarks || 0;
    });
  }
});

module.exports = View;
