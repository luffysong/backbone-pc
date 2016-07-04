/**
 * 场控
 */
'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var PermissionModel = require('../../models/live-room/permission.model');

// 清屏,锁屏
// var RoomControlView = require('../anchor/room-control.view');

var View = BaseView.extend({
  el: '',
  clientRender: false,
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.elements = {};
    this.queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
    this.permsssionModel = new PermissionModel();
    this.userControlTpl = '<div class="controls_forbid_reject" style="display: block;"> ' +
      '<a href="javascript:;" class="forbid">禁言</a> ' +
      '<a href="javascript:;" class="reject">踢出</a></div>';
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node

    this.elements.roomManagerWrap = $('#roomManagerWrap');
    this.elements.sendMessageWrap = $('#sendMessageWrap');
  },
  ready: function (ops) {
    //  初始化
    this.defineEventInterface();
    this.options = _.extend({}, ops);
    // this.elements.roomManagerWrap.hide();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (roomInfo) {
      if (roomInfo) {
        self.roomInfo = roomInfo;
        self.checkPermission();
      }
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 检查当前用户权限
  checkPermission: function () {
    var self = this;
    var promise = this.permsssionModel.executeJSONP(_.extend({
      roomId: this.roomInfo.id || 0
    }, this.queryParams));

    promise.done(function (res) {
      if (res && res.code === '0') {
        self.hasAccess(res.data);
      }
    });
  },
  hasAccess: function (data) {
    var self = this;
    _.each(data, function (item) {
      if (item.roomId === self.roomInfo.id) {
        self.render();
      }
    });
  },
  render: function () {
    // this.elements.roomManagerWrap.show();
    // this.elements.sendMessageWrap.hide();
    // if (!this.roomCtrlView) {
    //   this.roomCtrlView = new RoomControlView({
    //     el: '#roomManagerWrap',
    //     roomInfo: this.roomInfo,
    //     FlashApi: this.options.FlashApi,
    //     msgList: this.options.msgList,
    //     hideCtrl: true // 隐藏场控管理
    //   });
    // }
    window.location.href = '/assistant.html?roomId=' + this.roomInfo.id;
  },
  // 控制用户的禁言， 踢出
  renderUserControl: function (msgList) {
    var self = this;
    if (msgList) {
      $(msgList).on('click', function (e) {
        self.userControlClick(e);
      });
    }
  },
  userControlClick: function () {}
});

module.exports = View;
