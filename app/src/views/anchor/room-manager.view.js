/**
 * 场控管理, 添加，删除
 */
'use strict';

var _ = require('underscore');
var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomManagerListModel = require('../../models/anchor/room-manager-list.model.js');
var RoomManagerAddModel = require('../../models/anchor/room-manager-add.model.js');
var RoomManagerRemoveModel = require('../../models/anchor/room-manager-delete.model.js');

var msgBox = require('ui.msgBox');
var uiConfirm = require('ui.confirm');

var View = BaseView.extend({
  el: '#field-control',
  clientRender: false,
  events: {
    'click .btn-link': 'removeClickHandler',
    'click #btnAdd': 'addClickHandler'
  },
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };

    this.roomManagerListParams = _.extend({}, this.queryParams);

    this.roomManListModel = RoomManagerListModel.sharedInstanceModel();
    this.roomManAddModel = RoomManagerAddModel.sharedInstanceModel();
    this.roomManRemoveModel = RoomManagerRemoveModel.sharedInstanceModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  findElements: function () {
    this.userListDom = this.$el.find('.user-list');
    this.itemTpl = require('./template/field-control-item.html');
    this.userIdDom = this.$el.find('#txtUserID');
  },
  ready: function (ops) {
    //  初始化
    this.roomInfo = ops.roomInfo || {};

    this.defineEventInterface();
  },
  defineEventInterface: function () {
    var self = this;
    // 添加用户为场控
    Backbone.on('event:addUserToManager', function (userId) {
      // self.addRoomManager(userId);
      self.checkUserIsManager(userId);
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  renderPage: function () {
    // 'click .btn-link': 'removeClickHandler',
    // 'click #btnAdd': 'addClickHandler'
    if (this.$el.length < 1) {
      this.$el = $(this.$el.selector);
      this.$el.find('.user-list').on('click', this.removeClickHandler.bind(this));
      this.$el.find('#btnAdd').on('click', this.addClickHandler.bind(this));
      this.renderRoomMangerList();
      this.findElements();
    }
  },
  // 删除场控
  removeClickHandler: function (e) {
    var target = $(e.target);
    var userId = target.attr('data-id');
    var self = this;
    if (!userId) {
      return;
    }
    uiConfirm.show({
      content: '您确定要删除该场控吗?',
      okFn: function () {
        self.removeRoomManger(userId);
      }
    });
  },
  // 删除场控
  removeRoomManger: function (id) {
    var promise = this.roomManRemoveModel.executeJSONP(_.extend({
      userId: id,
      roomId: this.roomInfo.id
    }, this.queryParams));
    promise.done(function (res) {
      if (res && res.data.success) {
        msgBox.showOK('成功移除该场控');
        $('[dom-id="' + id + '"]').remove();
      } else {
        msgBox.showError('移除场控失败');
      }
    });
  },
  // 添加场控
  addClickHandler: function () {
    var userId = $.trim(this.userIdDom.val());
    if (!this.verifyUserID(userId)) {
      msgBox.showTip('请输入正确的用户编号');
      return null;
    }
    // this.addRoomManager(userId);
    this.checkUserIsManager(userId);
    return true;
  },
  verifyUserID: function (id) {
    return /^\d+$/.test(id);
  },
  checkUserIsManager: function (uid) {
    var self = this;
    var promise = this.getManagerList();
    promise.done(function (res) {
      var current = _.find(res.data, function (item) {
        return item.user.uid === ~~uid;
      });
      if (!current) {
        self.addRoomManager(uid);
      } else {
        msgBox.showTip('该用户已经是场控了');
      }
    });
  },
  addRoomManager: function (id) {
    var self = this;
    var promise = self.roomManAddModel.executeJSONP(_.extend({}, this.queryParams, {
      userId: id,
      roomId: this.roomInfo.id || 0
    }));
    promise.done(function (res) {
      if (res && res.code === '0') {
        msgBox.showOK('场控添加成功');
        self.renderRoomMangerList();
        self.userIdDom.val('');
      } else {
        msgBox.showError('场控添加失败');
      }
    });
  },
  getManagerList: function () {
    this.roomManagerListParams.roomId = this.roomInfo.id;
    return this.roomManListModel.executeJSONP(this.roomManagerListParams);
  },
  // 渲染场控列表
  renderRoomMangerList: function () {
    var self = this;
    // this.roomManagerListParams.roomId = this.roomInfo.id;
    // var promise = this.roomManListModel.executeJSONP(this.roomManagerListParams);
    var promise = this.getManagerList();
    promise.done(function (res) {
      if (res && res.code === '0') {
        self.renderRoomManItem(res);
      }
    });
  },
  renderRoomManItem: function (res) {
    var result = _.filter(res.data, function (item) {
      return item.user && item.user.uid !== user.get('userId');
    });
    var html = this.compileHTML(this.itemTpl, {
      data: result
    });
    this.userListDom.html(html);
  }
});

module.exports = View;
