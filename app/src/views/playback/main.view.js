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
var _ = require('underscore');

var BaseView = base.View; // View的基类
var Auxiliary = require('auxiliary-additions');

var URL = Auxiliary.url;
var uiConfirm = require('ui.confirm');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomDetailModel = require('../../models/anchor/room-detail.model');
var RoomLongPollingModel = require('../../models/anchor/room-longPolling.model');

var YYTIMServer = require('imServer');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var AnchorUserInfoModel = require('../../models/anchor/anchor-info.model');
var UserInfo = require('../live-room/user.js');
var FlashAPI = require('FlashApi');
var store = base.storage;
var InAndOurRoomModel = require('../../models/live-room/inAndOut-room.model');
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
    this.inAndOutRoom = InAndOurRoomModel.sharedInstanceModel();
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
    this.inAndRoomParams = _.extend({}, this.queryParams);
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.roomBg = $('.header-bg');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    var f = user.isLogined() ? '用户已登录' : '用户未登录';
    console.log(f);
    store.remove('imSig');
    // if (!user.isLogined()) {
    //   store.remove('imSig');
    //   store.set('signout', 1);
    //   msgBox.showTip('请登录后观看回放!');
    //   window.location.href = '/login.html';
    // }
    this.defineEventInterface();
    this.flashAPI = FlashAPI.sharedInstanceFlashApi({
      el: 'broadCastFlash'
    });
    if (user.isLogined()) {
      this.initWebimAfterLogin();
    } else {
      this.initWebIM().then(function () {
        this.renderPage();
        this.initFlash();
      }.bind(this), function () {
        console.log('webim 初始化失败');
        this.goBack();
      }.bind(this));
    }
  },
  defineEventInterface: function () {},
  renderPage: function () {
    var RoomTitle = require('../live-room/room-title.view');
    var AnchorCardView = require('../live-room/anchor-card.view');
    var PlayedListView = require('../live-room/played-list.view');
    var GiftView = require('../live-room/gift.view');
    var SendMessageView = require('./send-message.view');
    var ChatView = require('./chat.view');
    var a = new SendMessageView();
    a = new RoomTitle();
    a = new ChatView();
    a = new AnchorCardView({
      share: {
        url: '/playback.html?roomId=' + this.roomId
      }
    });
    a = new PlayedListView();
    a = new GiftView();
    console.log(a);
    $('#btnLike').css('display', 'none');
    $('#txtLikeCount').css('display', 'none');
  },
  initWebimAfterLogin: function () {
    // 腾讯im初始化，以及相关的操作
    this.initWebIM().then(function () {
      this.renderPage();
      this.getUserInfo();
    }.bind(this), function () {
      console.log('webim 初始化失败');
      this.goBack();
    }.bind(this));
  },
  initFlash: function () {
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
        self.roomInfo = data;
        self.redirectByRoomStatus(data.status, data.id);
        Backbone.trigger('event:roomInfoReady', self.roomInfo);
        self.setRoomBgImg();
        self.flashAPI.onReady(function () {
          this.init(self.roomInfo);
        });
        self.checkRoomStatus(data.status);
      } else {
        errFn();
      }
    }, errFn);
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
        if (self.userInfo) {
          self.adWallView = new AdvertisingWallView({
            el: '#advertisingWall',
            roomId: data.id,
            userInfo: self.userInfo,
            type: 1 // 直播
          });
        }
        self.roomInfo = data;
        self.redirectByRoomStatus(data.status, data.id);
        Backbone.trigger('event:roomInfoReady', self.roomInfo);
        self.setRoomBgImg();
        self.flashAPI.onReady(function () {
          this.init(self.roomInfo);
        });
        self.checkRoomStatus(data.status);
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
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        this.joinRoom();
        this.fetchUserIMSig(this.roomInfo.imGroupid);
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
  },
  initWebIM: function () {
    // 注册IM事件处理
    return YYTIMServer.init({
      onConnNotify: function (notifyInfo) {
        Backbone.trigger('event:onConnNotify', notifyInfo);
      },
      onMsgNotify: function (notifyInfo) {
        Backbone.trigger('event:playbackOnMsgNotify', notifyInfo);
      },
      onGroupInfoChangeNotify: function (notifyInfo) {
        Backbone.trigger('event:onGroupInfoChangeNotify', notifyInfo);
      }
    });
  },
  joinRoom: function () {
    var promise;
    this.inAndRoomParams.type = 1;

    if (this.roomInfo) {
      this.inAndRoomParams.roomId = this.roomInfo.id;
    }
    // 告诉服务器加入了IM房间
    promise = this.inAndOutRoom.executeJSONP(this.inAndRoomParams);
    promise.done(function () {});
    // 加入历史记录
    // this.historyAdd.addToHistory(_.extend({
    //   roomIds: this.roomInfo.id
    // }, this.queryParams));
  },
  fetchUserIMSig: function (groupId) {
    var self = this;
    var defer = imModel.fetchIMUserSig();
    defer.then(function (sig) {
      self.removeUserFromGroup(sig, groupId);
      // if (sig.roleType === 2) {
        // uiConfirm.show({
        //   title: '请登录',
        //   content: '您现在是游客模式,请先登录参与互动!',
        //   cancelBtn: false,
        //   cancelFn: function () {
        //     window.location.href = '/web/login.html';
        //   },
        //   okFn: function () {
        //     window.location.href = '/web/login.html';
        //   }
        // });
      //   self.removeUserFromGroup(sig, groupId);
      // } else {
      //   self.removeUserFromGroup(sig, groupId);
      // }
    });
  },
  removeUserFromGroup: function (sig, groupId) {
    var self = this;
    var options = {
      Member_Account: sig.imIdentifier,
      Limit: '',
      Offset: 0
    };
    // 先将用户将以前的群组删除;
    if (sig.anchor === null || sig.anchor !== null) {
      YYTIMServer.getJoinedGroupListHigh(options, function (res) {
        if (res.GroupIdList.length > 0) {
          for (var i = 0; i < res.GroupIdList.length; i++) {
            var gId = res.GroupIdList[i].GroupId;
            if (gId) {
              var p = { GroupId: gId };
              YYTIMServer.quitGroup(p, function (r) {
                if (r.ErrorCode === 0) {
                  console.log(r, '退群成功！');
                }
              }, function (r) {
                if (r.ErrorCode === 10009) {
                  console.log(r, '主播不能退出群组！');
                }
              });
            }
          }
        }
        self.userJoinGroup(sig, groupId);
      }, function (res) {
        console.log(res);
      });
    }
  },
  userJoinGroup: function (sig, groupId) {
    var self = this;
    self.userIMSig = sig;
    // self.initWebIM();
    YYTIMServer.applyJoinGroup(groupId, function (r) {
      console.log(r, '加群成功！');
    }, function (res) {
      self.imErrorHandler(res);
    });
  },
  /**
   * webim 错误处理
   * @constructor
   */
  imErrorHandler: function (res) {
    var self = this;
    var callback = function () {
      imModel.remove();
      self.goBack();
    };
    if (res.ErrorCode === 10013) {
      Backbone.trigger('event:roomInfoReady', self.roomInfo);
    } else if (res.ErrorCode === 70001) {
      uiConfirm.show({
        title: '登陆已过期',
        content: '您的登陆信息已经过期,请重新登陆!',
        cancelBtn: false,
        okFn: callback
      });
    } else if (res.ErrorCode === 10010) {
      uiConfirm.show({
        title: '进入房间失败',
        content: '该房间已经关闭,无法观看直播',
        cancelFn: self.goBack,
        okFn: self.goBack
      });
    } else {
      uiConfirm.show({
        title: '进入房间',
        content: '进入房间失败,请稍后重试',
        cancelFn: self.goBack,
        okFn: self.goBack
      });
    }
  },
  redirectByRoomStatus: function (st, roomId) {
    if (st === 1 || st === 2) {
      window.location.href = '/liveroom.html?roomId=' + roomId;
    }
  }
});

module.exports = View;
