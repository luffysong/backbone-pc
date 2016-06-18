/**
 * 顶上去
 */
'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var uiConfirm = require('ui.confirm');
var PopularityModel = require('../../models/live-room/popularity-add.model');
var msgBox = require('ui.msgBox');
var UserInfo = require('./user.js');

var View = BaseView.extend({
  el: '',
  events: {
    'click .btn-push': 'topClick'
  },
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.popularityModel = PopularityModel.sharedInstanceModel();
    this.popularityParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      type: 1,
      roomId: 0
    };
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.isNeedPopup = true;
  },
  ready: function () {
    //  初始化
    this.defineEventInterface();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
      }
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  /**
   * 按钮点击
   */
  topClick: function () {
    var self = this;
    // if (!this.roomStatusCheck()) {
    //  return;
    // }
    if (!this.isNeedPopup) {
      self.pushPopularity(2);
      return;
    }
    var content = '<div>使用 <span class="green">20</span>积分支持一下MC,当前共有<span class="green">'
      + (this.currentUserInfo.totalMarks || 0) + '</span>积分</div></br>'
      + '<div style="text-align:right; color:#999;"> <label>' +
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
    this.popularityParams.roomId = this.roomInfo.id;
    var promise = this.popularityModel.executeJSONP(this.popularityParams);
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS' && type === 1) {
        Backbone.trigger('event:pleaseUpdateRoomInfo');
        self.getUserInfo();
      } else if (res && res.data.success && type === 2) {
        msgBox.showOK('非常感谢您的大力支持');
        Backbone.trigger('event:pleaseUpdateRoomInfo');
        self.getUserInfo();
      } else {
        msgBox.showTip(res.data.message || '操作失败请您稍后重试');
      }
    });
    promise.fail(function () {
      msgBox.showTip('操作失败请您稍后重试');
    });
  },
  getUserInfo: function () {
    UserInfo.getInfo(function (userInfo) {
      Backbone.trigger('event:currentUserInfoReady', userInfo);
    });
  }
});

module.exports = View;
