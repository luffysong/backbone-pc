/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var URL = require('url');
var uiConfirm = require('ui.Confirm');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomDetailModel = require('../../model/anchor/room-detail.model');
var RoomLongPollingModel = require('../../model/anchor/room-longPolling.model');
var msgBox = require('ui.MsgBox');
var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var YYTIMServer = require('../../lib/YYT_IM_Server');
var AnchorUserInfoModel = require('../../model/anchor/anchor-info.model');
var UserInfo = require('./user.js');
var InAndOurRoomModel = require('../../model/live-room/inAndOut-room.model.js');
var FlashAPI = require('FlashAPI');
var store = require('store');
var AddWatchReordModel = require('../../model/anchor-setting/add-watch-record.model');

var View = BaseView.extend({
  clientRender: false,
  el: '#anchorContainerBg', //设置View对象作用于的根元素，比如id
  events: { //监听事件

  },
  //当模板挂载到元素之前
  beforeMount: function () {
    var url = URL.parse(location.href);
    if (!url.query['roomId']) {
      window.history.go(-1);
    }
    this.roomId = url.query['roomId'] || 1;

    this.roomInfoPeriod = 5 * 1000;

    this.roomDetail = RoomDetailModel.sigleInstance();

    this.anchorInfoModel = AnchorUserInfoModel.sigleInstance();
    this.inAndOutRoom = InAndOurRoomModel.sigleInstance();
    this.addWatchRecordModel = AddWatchReordModel.sigleInstance();

    this.roomDetailParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      roomId: ''
    };

    this.roomLongPolling = RoomLongPollingModel.sigleInstance();

    this.anchorInfoParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
    this.inAndRoomParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
    this.addWatchRecordParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };


  },
  //当模板挂载到元素之后
  afterMount: function () {
    this.roomBg = $('#anchorContainerBg');

  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.defineEventInterface();

    if (!user.isLogined() || imModel.$get('data.roleType') === 2) {
      imModel.remove();
      //store.remove('imSig');
      //store.set('signout', 1);
      msgBox.showTip('请登录后观看直播!');
      window.location.href = '/web/login.html';
    }
    this.flashAPI = FlashAPI.sharedInstanceFlashAPI({
      el: 'broadCastFlash'
    });

    this.getUserInfo();
    //this.initRoom();
    this.renderPage();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:UserKickOut', function (notifyInfo) {
      self.checkUserIsKickout(notifyInfo);
    });

    Backbone.on('event:pleaseUpdateRoomInfo', function () {
      self.roomDetailParams.roomId = self.roomId;
      self.getRoomLoopInfo(function (res) {
        var data = res.data;
        Backbone.trigger('event:updateRoomInfo', data);
      });

    });
  },
  fetchUserIMSig: function (groupId) {
    var self = this;
    imModel.fetchIMUserSig(function (sig) {
      if (sig.roleType == 2) {
        uiConfirm.show({
          title: '请登录',
          content: '您现在是游客模式,请先登录参与互动!',
          cancelBtn: false,
          cancelFn: function () {
            window.location.href = '/web/login.html';
          },
          okFn: function () {
            window.location.href = '/web/login.html';
          }
        });
      } else {
        self.userIMSig = sig;
        self.initWebIM();
        var goBack = function (url) {
          if (url) {
            window.location.href = url;
          } else {
            window.location.href = '/';
          }
        };
        YYTIMServer.applyJoinGroup(groupId, function (res) {
          Backbone.trigger('event:roomInfoReady', self.roomInfo);
          if (self.roomInfo.status == 2) {
            self.loopRoomInfo();
            self.addWatchRecord(self.roomInfo.id);
          }
        }, function (res) {
          if (res.ErrorCode == 10013) {
            //self.renderPage();
            Backbone.trigger('event:roomInfoReady', self.roomInfo);
            if (self.roomInfo.status == 2) {
              self.loopRoomInfo();
            }
          } else {
            uiConfirm.show({
              title: '进入房间',
              content: '进入房间失败,请稍后重试',
              cancelFn: goBack,
              okFn: goBack
            });

          }
        });

      }
    });
  },
  renderPage: function () {
    var RoomTitle = require('./room-title.view');
    new RoomTitle();

    var ChatView = require('./chat.view');
    new ChatView();

    var SendMessageView = require('./send-message.view');
    new SendMessageView();

    var AnchorCardView = require('./anchor-card.view');
    new AnchorCardView();

    var PlayedListView = require('./played-list.view');
    new PlayedListView();

    var GiftView = require('./gift.view');
    new GiftView();

  },
  initWebIM: function () {
    var self = this;

    function callback(notifyInfo) {
      Backbone.trigger('event:groupSystemNotifys', notifyInfo);
    }

    //注册IM事件处理
    YYTIMServer.init({
      'onConnNotify': function (notifyInfo) {
        Backbone.trigger('event:onConnNotify', notifyInfo);
      },
      'onMsgNotify': function (notifyInfo) {
        Backbone.trigger('event:onMsgNotify', notifyInfo);
      },
      'onGroupInfoChangeNotify': function (notifyInfo) {
        Backbone.trigger('event:onGroupInfoChangeNotify', notifyInfo);
      },
      'groupSystemNotifys': {
        "1": callback, //申请加群请求（只有管理员会收到）
        "2": callback, //申请加群被同意（只有申请人能够收到）
        "3": callback, //申请加群被拒绝（只有申请人能够收到）
        "4": callback, //被管理员踢出群(只有被踢者接收到)
        "5": callback, //群被解散(全员接收)
        "6": callback, //创建群(创建者接收)
        "7": callback, //邀请加群(被邀请者接收)
        "8": callback, //主动退群(主动退出者接收)
        "9": callback, //设置管理员(被设置者接收)
        "10": callback, //取消管理员(被取消者接收)
        "11": callback, //群已被回收(全员接收)
        "255": callback //用户自定义通知(默认全员接收,暂不支持)
      }
    });

  },
  initRoom: function () {
    var self = this,
      errFn = function () {
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
      if (response && response.code == '0') {
        self.videoUrl = {
          'streamName': data.streamName,
          'url': data.url
        };
        self.roomInfo = data;

        self.setRoomBgImg();
        self.flashAPI.onReady(function () {
          this.init(self.roomInfo);
        });

        imModel.updateIMUserSig(function () {
          self.joinRoom();
          self.fetchUserIMSig(data.imGroupid);
          self.checkRoomStatus(data.status);
        });
      } else {
        errFn();
      }
    }, errFn);
  },
  getGroupInfo: function (imGroupId) {
    var self = this;
    YYTIMServer.getGroupInfo(imGroupId, function (res) {
      if (res && res.ErrorCode == 0) {
        self.currentGroupInfo = _.find(res.GroupInfo, function (item) {
          return item.GroupId == self.roomInfo.imGroupid;
        });

        Backbone.trigger('event:IMGroupInfoReady', self.currentGroupInfo);
        self.checkUserIsKickout(self.currentGroupInfo.Notification);
        //TODO
        self.checkLockScreen(self.currentGroupInfo.Introduction);

      } else {
      }
    }, function (err) {
    });
  },
  getUserInfo: function () {
    var self = this;
    UserInfo.getInfo(function (userInfo) {
      self.userInfo = userInfo;
      Backbone.trigger('event:currentUserInfoReady', userInfo);
      self.initRoom();
    });
    //this.anchorInfoModel.executeJSONP(this.anchorInfoParams, function (res) {
    //    if(res){
    //        Backbone.trigger('event:currentUserInfoReady', res.data);
    //    }
    //}, function () {
    //
    //});
  },
  getRoomInfo: function (okFn, errFn) {
    var self = this;
    self.roomDetailParams.roomId = self.roomId;
    this.roomDetail.executeJSONP(self.roomDetailParams, function (response) {
      okFn && okFn(response);
    }, function (err) {
      errFn && errFn(err);
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
        this.getGroupInfo(this.roomInfo.imGroupid);
        break;
      case 3:
        break;
    }
  },
  checkUserIsKickout: function (notifyInfo) {
    var self = this;
    var notify = null;
    try {
      if (_.isString(notifyInfo)) {
        notify = JSON.parse(notifyInfo);
      } else {
        notify = notifyInfo;
      }
    } catch (e) {
    }
    var msg = '您已经被主播踢出房间,肿么又回来了';
    if (notifyInfo.isEvent) {
      msg = '您已经被主播踢出房间!';
    }
    if (notify) {
      var result = _.find(notify.forbidUsers, function (item) {
        return item.replace('$0', '') == self.userIMSig.userId;
      });
      if (result) {
        UserInfo.setKickout(self.roomId, true);

        uiConfirm.show({
          title: '禁止进入',
          content: msg,
          cancelBtn: false,
          okFn: function () {
            self.goBack();
          },
          cancelFn: function () {
            self.goBack();
          }
        });
      }
    }
  },
  checkLockScreen: function (notifyInfo) {
    console.log('-------', notifyInfo);
    var notify = null;
    try {
      if (_.isString(notifyInfo)) {
        notify = JSON.parse(notifyInfo);
      } else {
        notify = notifyInfo;
      }
    } catch (e) {
    }
    UserInfo.setLockScreen(this.roomInfo.id, notify.blockState || false);
  },
  goBack: function () {
    window.history.go(-1);
  },
  loopRoomInfo: function (time) {
    var self = this;

    self.roomInfoTimeId = setTimeout(function () {
      self.roomDetailParams.roomId = self.roomId;
      //self.getRoomInfo(function (res) {
      self.getRoomLoopInfo(function (res) {
        var data = res.data;
        Backbone.trigger('event:updateRoomInfo', data);
        if (data.roomStatus == 3) {
          Backbone.trigger('event:liveShowEnded', data);
        } else if (data.roomStatus == 2) {
          self.loopRoomInfo();
        }
      });
    }, !!time ? time : self.roomInfoPeriod);
  },
  getRoomLoopInfo: function (okFn, errFn) {
    var self = this;
    self.roomDetailParams.roomId = self.roomId;
    this.roomLongPolling.executeJSONP(self.roomDetailParams, function (response) {
      okFn && okFn(response);
    }, function (err) {
      errFn && errFn(err);
    });
  },
  joinRoom: function () {
    this.inAndRoomParams.type = 1;

    if (this.roomInfo) {
      this.inAndRoomParams.roomId = this.roomInfo.id;
    }
    this.inAndOutRoom.executeJSONP(this.inAndRoomParams, function (res) {

    });
  },
  setRoomBgImg: function () {
    if (this.roomInfo && this.roomInfo.imageUrl) {
      this.roomBg.css('background', 'url(' + this.roomInfo.imageUrl + ')');
    }
  },
  addWatchRecord: function (roomId) {
    var self = this;
    this.addWatchRecordParams.roomIds = roomId;

    this.addWatchRecordModel.executeJSONP(this.addWatchRecordParams, function (res) {
      console.log(res);
    });
  }


});

module.exports = View;