/**
 * 场控
 */
'use strict';

var _ = require('underscore');
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
    this.userListDom = this.$el.find('.user-list');
    this.itemTpl = this.$el.find('#itemTpl').html();
    this.userIdDom = this.$el.find('#txtUserID');
  },
  ready: function (ops) {
    //  初始化
    this.roomInfo = ops.roomInfo || {};

    this.renderRoomMangerList();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 删除场控
  removeClickHandler: function (e) {
    var target = $(e.target);
    var userId = target.attr('data-id');
    var self = this;
    uiConfirm.show({
      content: '您确定要删除该场控吗?',
      okFn: function () {
        self.removeRoomManger(userId);
      }
    });
  },
  removeRoomManger: function (id) {
    var promise = this.roomManRemoveModel.executeJSONP(_.extend({
      userId: id,
      roomId: this.roomInfo.id
    }, this.queryParams));
    promise.done(function (res) {
      if (res && res.code) {
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
    this.addRoomManager(userId);
    return true;
  },
  verifyUserID: function (id) {
    return /^\d+$/.test(id);
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
  // 渲染场控列表
  renderRoomMangerList: function () {
    var self = this;
    this.roomManagerListParams.roomId = this.roomInfo.id;
    var promise = this.roomManListModel.executeJSONP(this.roomManagerListParams);
    promise.done(function (res) {
      if (res && res.code === '0') {
        self.renderRoomManItem(res);
      } else {
        msgBox.showError('场控添加失败');
      }
    });
  },
  renderRoomManItem: function (res) {
    var html = this.compileHTML(this.itemTpl, res);
    this.userListDom.html(html);
  }
});

module.exports = View;
