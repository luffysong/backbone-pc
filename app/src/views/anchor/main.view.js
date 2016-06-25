/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var Auxiliary = require('auxiliary-additions');
var imServer = require('imServer');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var URL = Auxiliary.url;
var uiConfirm = require('ui.confirm');
var store = base.storage;
var auth = require('auth');

var RoomDetailModel = require('../../models/anchor/room-detail.model');
var RoomLongPollingModel = require('../../models/anchor/room-longPolling.model');
var GiftModel = require('../../models/anchor/gift.model');
var PermissionModel = require('../../models/live-room/permission.model');

var View = BaseView.extend({
  clientRender: false,
  el: '#anchorContainerBg', // 设置View对象作用于的根元素，比如id
  events: { // 监听事件
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    var url = URL.parse(location.href);

    auth.onlyAnchorUse();
    this.roomId = url.query.roomId || 1;
    // 获取房间信息周期
    this.roomInfoPeriod = 10000;

    if (!this.roomId) {
      this.goBack();
    }
    this.queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
    this.giftModel = GiftModel.sharedInstanceModel();
    this.roomDetail = RoomDetailModel.sharedInstanceModel();
    this.permsssionModel = new PermissionModel();

    this.roomDetailParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      roomId: ''
    };

    this.giftParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      offset: 0,
      size: 90000,
      type: 0
    };
    this.roomLongPolling = RoomLongPollingModel.sharedInstanceModel();
  },
  // 当模板挂载到元素之后
  afterMount: function () {},
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function (ops) {
    this.options = _.extend({}, ops);
    this.userVerify();

    // this.fieldControl = new FieldControl();

    Backbone.on('event:stopLoopRoomInfo', function () {
      // clearTimeout(self.roomInfoTimeId);
    });
  },
  initWebIM: function () {
    function callback(notifyInfo) {
      Backbone.trigger('event:groupSystemNotifys', notifyInfo);
    }

    // 注册IM事件处理
    imServer.init({
      onConnNotify: function (notifyInfo) {
        Backbone.trigger('event:onConnNotify', notifyInfo);
      },
      onMsgNotify: function (notifyInfo) {
        Backbone.trigger('event:onMsgNotify', notifyInfo);
      },
      onGroupInfoChangeNotify: function (notifyInfo) {
        Backbone.trigger('event:onGroupInfoChangeNotify', notifyInfo);
      },
      groupSystemNotifys: {
        1: callback, // 申请加群请求（只有管理员会收到）
        2: callback, // 申请加群被同意（只有申请人能够收到）
        3: callback, // 申请加群被拒绝（只有申请人能够收到）
        4: callback, // 被管理员踢出群(只有被踢者接收到)
        5: callback, // 群被解散(全员接收)
        6: callback, // 创建群(创建者接收)
        7: callback, // 邀请加群(被邀请者接收)
        8: callback, // 主动退群(主动退出者接收)
        9: callback, // 设置管理员(被设置者接收)
        10: callback, // 取消管理员(被取消者接收)
        11: callback, // 群已被回收(全员接收)
        255: callback //  用户自定义通知(默认全员接收,暂不支持)
      }
    });
  },
  /**
   * 校验用户
   */
  userVerify: function () {
    var self = this;

    if (user.isLogined()) {
      self.initWebIM();

      // self.initGiftList();

      self.initRoom();
    } else {
      store.remove('imSig');
      store.set('signout', 1);
      window.location.href = '/login.html';
    }
  },
  checkRoomAccess: function () {
    var self = this;
    var defer = $.Deferred();
    var promise = this.permsssionModel.executeJSONP(_.extend({
      roomId: this.roomId || 0
    }, this.queryParams));
    promise.done(function (res) {
      console.log('--------', res);
      if (res && res.data) {
        var curRoom = _.find(res.data, function (item) {
          return item.roomId === ~~self.roomId;
        });
        if (curRoom) {
          if (curRoom.operationRole === 1 || curRoom.operationRole === 2) {
            defer.resolve();
          } else {
            defer.reject();
          }
        } else {
          defer.reject();
        }
      }
    });
    return defer.promise();
  },
  /**
   * 初始化房间信息
   */
  initRoom: function () {
    var self = this;
    // self.roomDetailParams.roomId = self.roomId;
    this.getRoomInfo(function (response) {
      var data = response.data;
      self.videoUrl = {
        streamName: data.streamName,
        url: data.url
      };
      self.renderPage();
      self.checkRoomAccess().done(function () {
        Backbone.trigger('event:roomInfoReady', data);
        if (data.status === 2) {
          self.loopRoomInfo();
        }
      }).fail(function () {
        self.goBack();
      });
      // if (!data.mine) {
      // self.goBack();
      // }
    }, function () {
      uiConfirm.show({
        title: '提示',
        content: '获取房间数据失败!',
        okFn: function () {
          self.goBack();
        },
        cancelFn: function () {
          self.goBack();
        }
      });
    });
  },
  loopRoomInfo: function () {
    var self = this;
    self.roomInfoTimeId = setTimeout(function () {
      self.roomDetailParams.roomId = self.roomId;
      // self.getRoomInfo(function (res) {
      self.getRoomLoopInfo(function (res) {
        var data = res.data;
        Backbone.trigger('event:updateRoomInfo', data);
        self.loopRoomInfo();
      });
    }, self.roomInfoPeriod);
  },
  getRoomLoopInfo: function (okFn, errFn) {
    var self = this;
    var promise;
    self.roomDetailParams.roomId = self.roomId;
    promise = this.roomLongPolling.executeJSONP(self.roomDetailParams);
    promise.done(function (response) {
      if (okFn) {
        okFn(response);
      }
    });
    promise.fail(function (err) {
      if (errFn) {
        errFn(err);
      }
    });
  },
  /**
   * 获取房间数据
   * @return {[type]} [description]
   */
  getRoomInfo: function (okFn, errFn) {
    var self = this;
    var promise;
    self.roomDetailParams.roomId = self.roomId;
    promise = this.roomDetail.executeJSONP(self.roomDetailParams);
    promise.done(function (response) {
      if (okFn) {
        okFn(response);
      }
    });
    promise.fail(function (err) {
      if (errFn) {
        errFn(err);
      }
    });
  },
  /**
   * 载入页面其他视图
   */
  renderPage: function () {
    // 组件一，编辑背景图片
    var EditBgView = require('./anchor-edit-bg.view');
    // 组件二，主播信息
    var InfoView = require('./anchor-info.view');
    // 组件三，主播控制消息
    var ChatView = require('./anchor-chat.view');
    // 公告组件
    var NoticeView = require('./notice.view');
    // 直播开始,结束控制
    var LiveShowBtnView = require('./live-show-btn.view');

    var AssistantView = require('./assistant.view');

    var a = new EditBgView();
    a = new InfoView();
    a = new ChatView({
      type: 'control'
    });
    a = new NoticeView();
    a = new LiveShowBtnView();
    a = new AssistantView(this.options);
    console.log(a);
  },
  goBack: function () {
    window.location.href = '/anchor-setting.html';
  },
  initGiftList: function () {
    this.giftModel.get(this.giftParams, function () {}, function () {});
  }
});

module.exports = View;
