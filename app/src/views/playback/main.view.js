/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var store = base.storage;
var BaseView = base.View; // View的基类
var Auxiliary = require('auxiliary-additions');

var URL = Auxiliary.url;
var uiConfirm = require('ui.confirm');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomDetailModel = require('../../models/anchor/room-detail.model');
var RoomLongPollingModel = require('../../models/anchor/room-longPolling.model');
var msgBox = require('ui.msgBox');
// var YYTIMServer = require('imServer');
var AnchorUserInfoModel = require('../../models/anchor/anchor-info.model');
var UserInfo = require('../live-room/user.js');
var FlashAPI = require('FlashApi');

var AdvertisingWallView = require('../advertising-wall/main.view');

var View = BaseView.extend({
  clientRender: false,
  el: '#anchorContainerBg', // 设置View对象作用于的根元素，比如id
  events: { // 监听事件

  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    var url = URL.parse(location.href);
    if (!url.query.roomId) {
      window.history.go(-1);
    }
    this.roomId = url.query.roomId || 1;

    this.roomInfoPeriod = 10 * 1000;

    this.roomDetail = RoomDetailModel.sharedInstanceModel();

    this.anchorInfoModel = AnchorUserInfoModel.sharedInstanceModel();

    this.roomDetailParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      roomId: ''
    };

    this.roomLongPolling = RoomLongPollingModel.sharedInstanceModel();

    this.anchorInfoParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.roomBg = $('.header-bg');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    if (!user.isLogined()) {
      store.remove('imSig');
      store.set('signout', 1);
      msgBox.showTip('请登录后观看直播!');
      window.location.href = '/login.html';
    }
    this.defineEventInterface();
    this.flashAPI = FlashAPI.sharedInstanceFlashApi({
      el: 'broadCastFlash'
    });

    this.getUserInfo();
    // this.initRoom();
    this.renderPage();
  },
  defineEventInterface: function () {
  },
  renderPage: function () {
    var RoomTitle = require('../live-room/room-title.view');
    var AnchorCardView = require('../live-room/anchor-card.view');
    var PlayedListView = require('../live-room/played-list.view');
    var GiftView = require('../live-room/gift.view');

    var a = new RoomTitle();

    a = new AnchorCardView();

    a = new PlayedListView();

    a = new GiftView();
    console.log(a);
  },
  initRoom: function () {
    var self = this;
    var errFn = function () {
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
    };

    this.getRoomInfo(function (response) {
      var data = response.data || {};
      if (response && response.code === '0') {
        self.videoUrl = {
          streamName: data.streamName,
          url: data.url
        };
        // 告白墙
        self.adWallView = new AdvertisingWallView({
          el: '#advertisingWall',
          roomId: data.id,
          userInfo: self.userInfo,
          type: 1 // 直播
        });
        self.roomInfo = data;
        Backbone.trigger('event:roomInfoReady', self.roomInfo);
        self.setRoomBgImg();
        self.flashAPI.onReady(function () {
          this.init(self.roomInfo);
        });
      } else {
        errFn();
      }
    }, errFn);
  },
  getUserInfo: function () {
    var self = this;
    UserInfo.getInfo(function (userInfo) {
      self.userInfo = userInfo;
      self.initRoom();
      Backbone.trigger('event:currentUserInfoReady', userInfo);
    });
  },
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
  checkRoomStatus: function (status) {
    switch (status) {
      case 0:
        msgBox.showTip('该直播尚未发布!');
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      default:
        break;
    }
  },
  goBack: function () {
    window.history.go(-1);
  },
  setRoomBgImg: function () {
    if (this.roomInfo && this.roomInfo.imageUrl) {
      this.roomBg.css('background', 'url(' + this.roomInfo.imageUrl + ')');
    }
  }
});

module.exports = View;
