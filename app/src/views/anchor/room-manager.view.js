/**
 * 场控管理, 添加，删除
 */
'use strict';

var _ = require('underscore');
var $ = require('jquery');
var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;
var store = base.storage;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomManagerListModel = require('../../models/anchor/room-manager-list.model.js');
var RoomManagerAddModel = require('../../models/anchor/room-manager-add.model.js');
var RoomManagerRemoveModel = require('../../models/anchor/room-manager-delete.model.js');
var AnchorModel = require('../../models/anchor/anchor-info.model');

var msgBox = require('ui.msgBox');
var uiConfirm = require('ui.confirm');

var imServer = require('imServer');

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
    this.anchorModel = new AnchorModel();
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
    Backbone.on('event:addUserToManager', function (userInfo) {
      // self.addRoomManager(userId);
      self.userVerify(userInfo.userId, userInfo.userName);
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
    var msg = '<div style="text-align:center;color:#a1a1a1;" >' +
      target.attr('data-name') + '(' + userId + ')</div>';
    var uName = target.attr('data-name');
    uiConfirm.show({
      content: '您确定要删除该场控吗?' + msg,
      okFn: function () {
        self.removeRoomManger(userId, uName);
      }
    });
  },
  // 删除场控
  removeRoomManger: function (id, uName) {
    var promise = this.roomManRemoveModel.executeJSONP(_.extend({
      userId: id,
      roomId: this.roomInfo.id
    }, this.queryParams));
    // 修改了用户角色，发消息提示所有人；
    this.sendMsgAfterEditRole(id, 'Member', uName);
    //
    this.setMember(id, 'Member').done(function () {
      promise.done(function (res) {
        if (res && res.data.success) {
          msgBox.showOK('成功移除该场控');
          $('[dom-id="' + id + '"]').remove();
        } else {
          msgBox.showError('移除场控失败');
        }
      });
    }).fail(function () {
      msgBox.showError('移除场控失败');
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
    this.userVerify(userId, null, true);
    return true;
  },
  setMember: function (userId, type) {
    var defer = $.Deferred();
    var params = {
      GroupId: this.roomInfo.imGroupid,
      Role: type || 'Admin',
      Member_Account: userId + '$0'
    };
    console.log(params);
    // 修改了用户角色，发消息提示所有人；
    // this.sendMsgAfterEditRole(userId, type);
    //
    imServer.modifyGroupMember(params).done(function (res) {
      if (res.ActionStatus === 'OK') {
        defer.resolve();
      } else {
        defer.reject();
      }
    }).fail(function (err) {
      var msg = '';
      if (err.ActionStatus === 'FAIL') {
        switch (err.ErrorCode) {
          case 10004:
            msg = '该用户还没有进入房间，不是组员，不能设为场控';
            break;
          default:
            break;
        }
        if (msg.length > 0) {
          msgBox.showError(msg + '222');
        }
      }
      defer.reject(msg);
    });
    return defer.promise();
  },
  verifyUserID: function (id) {
    return /^\d+$/.test(id);
  },
  checkUserIsManager: function (uid) {
    var defer = $.Deferred();
    var promise = this.getManagerList();
    promise.done(function (res) {
      var current = _.find(res.data, function (item) {
        return item.user.uid === ~~uid;
      });
      if (current) {
        defer.resolve(true);
      } else {
        defer.reject(false);
      }
    });
    promise.fail(function () {
      defer.reject(false);
    });
    return defer.promise();
  },
  userVerify: function (uid, uName, justAdd) {
    var self = this;
    var promise = this.getManagerList();
    promise.done(function (res) {
      var current = _.find(res.data, function (item) {
        return item.user.uid === ~~uid;
      });

      var msg = '<div style="text-align:center;color:#a1a1a1;" >' +
        uName + '</div>';
      if (!current) {
        uiConfirm.show({
          content: '您确定将该用户设为场控吗?' + (uName ? msg : ''),
          okFn: function () {
            self.addRoomManager(uid, uName);
          }
        });
      } else {
        if (justAdd) {
          msgBox.showTip('该用户已经是场控了');
        } else {
          uiConfirm.show({
            content: '您确定要删除该场控吗?' + msg,
            okFn: function () {
              self.removeRoomManger(uid, uName);
            }
          });
        }
      }
    });
  },
  addRoomManager: function (id, uName) {
    var self = this;
    this.setMember(id, 'Admin').done(function () {
      var promise = self.roomManAddModel.executeJSONP(_.extend({}, self.queryParams, {
        userId: id,
        roomId: self.roomInfo.id || 0
      }));
      promise.done(function (res) {
        if (res && res.code === '0') {
          msgBox.showOK('场控添加成功');
          // 修改了用户角色，发消息提示所有人；
          self.sendMsgAfterEditRole(id, 'Admin', uName);
          //
          if (self.userIdDom) {
            self.userIdDom.val('');
          }
          self.renderRoomMangerList();
        } else {
          msgBox.showError('场控添加失败');
        }
      });
    }).fail(function (err) {
      msgBox.showError(err || '场控添加失败');
    });
  },
  beforeAdd: function () {},
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
  },
  sendMsgAfterEditRole: function (userId, type, uName) {
    var flag = (type === 'Admin') ? 'true' : 'false';
    var imSig = store.get('imSig');
    var self = this;
    var queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      userId: userId
    };
    console.log(uName);
    var promise = this.anchorModel.executeJSONP(queryParams);
    promise.done(function (res) {
      imServer.sendMessage({
        groupId: self.roomInfo.imGroupid,
        msg: {
          roomId: self.roomInfo.id || 0,
          msgType: 11,
          operaUser: imSig.userId,
          operaUsername: imSig.nickName,
          toUser: userId,
          toUsername: res.data.nickName,
          roomControl: flag
        }
      });
    });
  }
});

module.exports = View;
