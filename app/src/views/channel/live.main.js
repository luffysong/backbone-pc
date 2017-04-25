/**
 * @time {时间}
 * @author {编写者}
 * @info 频道播放页
 */
/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */
'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var _ = require('underscore');
var Auxiliary = require('auxiliary-additions');

var URL = Auxiliary.url;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var store = base.storage;
var RoomLongPollingModel = require('../../models/channel/loogpolling.model');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var YYTIMServer = require('imServer');
var AnchorUserInfoModel = require('../../models/anchor/anchor-info.model');
var UserInfo = require('../live-room/user.js');
var InAndOurRoomModel = require('../../models/channel/enter-out.model');
var ChannelDetailModel = require('../../models/channel/detail.model');
var LiveVideoListModel = require('../../models/channel/live-play.model');

var AnchorCardView = require('../live-room/anchor-card.view');

var FlashAPI = require('FlashApi');
var uiConfirm = require('ui.confirm');
var msgBox = require('ui.msgBox');

var AdvertisingWallView = require('../advertising-wall/main.view');

var View = BaseView.extend({
  clientRender: false,
  el: '#anchorContainerBg', // 设置View对象作用于的根元素，比如id
  events: { // 监听事件
    'click #channelTab': 'asideChanged'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    var url = URL.parse(location.href);
    if (!url.query.channelId && !url.query.channelId) {
      window.history.go(-1);
    }
    this.channelId = url.query.channelId || 1;

    this.roomInfoPeriod = 20 * 1000;

    this.anchorInfoModel = AnchorUserInfoModel.sharedInstanceModel();
    this.inAndOutRoom = InAndOurRoomModel.sharedInstanceModel();
    this.channelDetailModel = new ChannelDetailModel();
    this.liveVideoListModel = LiveVideoListModel.sharedInstanceModel();

    this.queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };

    this.channelDetailParams = _.extend({
      channelId: ''
    }, this.queryParams);

    this.roomLongPolling = RoomLongPollingModel.sharedInstanceModel();

    this.inAndRoomParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.roomBg = $('.header-bg');
    this.currentChannelShowStatus = {};
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    // 直播页面
    var self = this;
    store.remove('imSig');
    // if (!user.isLogined()) {
    //   store.remove('imSig');
    //   store.set('signout', 1);
    //   msgBox.showTip('请登录后观看直播!');
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
        self.renderPage();
        self.initFlash();
      }, function () {
        self.goBack();
      });
    }
  },
  defineEventInterface: function () {
    var self = this;

    Backbone.on('event:pleaseUpdateRoomInfo', function () {
      self.getRoomInfo(function (res) {
        Backbone.trigger('event:updateRoomInfo', res.data);
      });
    });
    Backbone.on('event:RoomLoopInfo', function (data) {
      var id = self.currentChannelShowStatus[self.currentChannelShowId];
      if (~~data.liveStatus === 2) {
        $('.channelLiveTip').text('');
      }
      if (data && self.currentChannelShowId && data.liveStatus !== id) {
        window.location.reload();
      }
    });
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
        self.setRoomBgImg();
        self.anchorView = new AnchorCardView({
          share: {
            url: '/channellive.html?channelId=' + self.channelId,
            img: data.posterPic || '',
            title: data.channelName || ''
          }
        });
        self.loopRoomInfo();
        self.joinRoom();
        self.getLiveViedoList();
        if (self.roomInfo) {
          Backbone.trigger('event:roomInfoReady', self.roomInfo);
        }
      } else {
        errFn();
      }
    }, errFn);
  },
  initWebimAfterLogin: function () {
    // 初始化im
    this.initWebIM().then(function () {
      this.renderPage();
      this.getUserInfo();
    }.bind(this), function () {
      this.goBack();
    }.bind(this));
  },
  fetchUserIMSig: function (groupId) {
    var self = this;
    var defer = imModel.fetchIMUserSig();

    defer.then(function (sig) {
      self.removeUserFromGroup(sig, groupId);
      // if (sig.roleType === 2) {
      //   uiConfirm.show({
      //     title: '请登录',
      //     content: '您现在是游客模式,请先登录参与互动!',
      //     cancelBtn: false,
      //     cancelFn: function () {
      //       window.location.href = '/web/login.html';
      //     },
      //     okFn: function () {
      //       window.location.href = '/web/login.html';
      //     }
      //   });
      // } else {
      //   self.userJoinGroup(sig, groupId);
      // }
    });
  },
  userJoinGroup: function (sig, groupId) {
    var self = this;
    self.userIMSig = sig;

    YYTIMServer.applyJoinGroup(groupId, function () {
      Backbone.trigger('event:roomInfoReady', self.roomInfo);
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
      // if (self.roomInfo.status === 2) {
      //   self.loopRoomInfo();
      // }
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
        content: '该房间已经关闭,无法观看直播!',
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
  renderPage: function () {
    var RoomTitle = require('../live-room/room-title.view');
    var ChatView = require('../live-room/chat.view');
    var SendMessageView = require('../live-room/send-message.view');
    var GiftView = require('../live-room/gift.view');
    var LiveVideoListView = require('./live-video-list.view');
    var type = {
      type: 'channel',
      channelId: this.channelId
    };

    var a = new RoomTitle();

    a = new ChatView(type);

    a = new SendMessageView(type);

    a = new GiftView(type);

    a = new LiveVideoListView();

    console.log(a);
  },
  initWebIM: function () {
    function callback(notifyInfo) {
      Backbone.trigger('event:groupSystemNotifys', notifyInfo);
    }

    // 注册IM事件处理
    return YYTIMServer.init({
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
        255: callback // 用户自定义通知(默认全员接收,暂不支持)
      }
    });
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
        self.roomInfo = data;
        self.setRoomBgImg();
        self.anchorView = new AnchorCardView({
          share: {
            url: '/channellive.html?channelId=' + self.channelId,
            img: data.posterPic || '',
            title: data.channelName || ''
          }
        });
        self.adWallView = new AdvertisingWallView({
          el: '#advertisingWall',
          roomId: data.channelId,
          userInfo: self.userInfo,
          type: 2
        });
        self.loopRoomInfo();

        self.joinRoom();
        // self.fetchUserIMSig(data.imGroupid);
        self.getLiveViedoList();
        // TODO
        // self.checkRoomStatus(data.status);
      } else {
        errFn();
      }
    }, errFn);
  },
  getGroupInfo: function (imGroupId) {
    var self = this;
    YYTIMServer.getGroupInfo(imGroupId, function (res) {
      if (res && ~~res.ErrorCode === 0) {
        self.currentGroupInfo = _.find(res.GroupInfo, function (item) {
          return item.GroupId === self.roomInfo.imGroupid;
        });

        Backbone.trigger('event:IMGroupInfoReady', self.currentGroupInfo);
        // self.checkUserIsDisabled(self.currentGroupInfo.Introduction);
      }
    }, function () {
      uiConfirm.show({
        title: '进入失败',
        content: '加入房间失败,请重新登陆后进入',
        cancelBtn: false,
        okFn: function () {
          self.goBack('/');
        },
        cancelFn: function () {
          self.goBack('/');
        }
      });
    });
  },
  getUserInfo: function () {
    var self = this;
    UserInfo.getInfo(function (userInfo) {
      self.userInfo = userInfo;
      Backbone.trigger('event:currentUserInfoReady', userInfo);
      self.initRoom();
    });
  },
  getRoomInfo: function (okFn, errFn) {
    var self = this;
    var promise;
    // self.roomDetailParams.channelId = self.channelId;
    self.channelDetailParams.channelId = self.channelId;
    promise = this.channelDetailModel.executeJSONP(self.channelDetailParams);
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
        this.getGroupInfo(this.roomInfo.imGroupid);
        break;
      case 3:
        break;
      default:
        break;
    }
  },
  parseNotifyInfo: function (notifyInfo) {
    var notify = null;
    try {
      if (_.isString(notifyInfo)) {
        notify = JSON.parse(notifyInfo);
      } else {
        notify = notifyInfo;
      }
    } catch (e) {
      return null;
    }
    return notify;
  },
  checkUserIsKickout: function (notifyInfo) {
    var self = this;
    var notify = self.parseNotifyInfo(notifyInfo);
    var msg = '您已经被主播踢出房间,肿么又回来了';
    if (notify && notifyInfo.isEvent) {
      msg = '您已经被主播踢出房间!';
    }
    if (notify) {
      var result = _.find(notify.forbidUsers, function (item) {
        return item.replace('$0', '') === self.userIMSig.userId;
      });
      if (result) {
        UserInfo.setKickout(self.channelId, true);

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
  goBack: function (url) {
    if (url) {
      window.location.href = url;
    } else {
      window.location.href = '/';
    }
  },
  loopRoomInfo: function (time) {
    var self = this;
    self.getRoomLoopInfo().then(function (data) {
      Backbone.trigger('event:RoomLoopInfo', data);
      Backbone.trigger('event:updateRoomInfo', data);
    });
    self.roomInfoTimeId = setTimeout(function () {
      self.loopRoomInfo();
    }, !!time ? time : self.roomInfoPeriod);
  },
  getRoomLoopInfo: function () {
    var self = this;
    var defer = $.Deferred();
    var promise = this.roomLongPolling.executeJSONP(_.extend({}, self.queryParams, {
      channelId: this.roomInfo.channelId
    }));
    promise.done(function (response) {
      if (~~response.code === 0) {
        defer.resolve(_.extend({
          now: response.now
        }, response.data));
      } else {
        defer.reject();
      }
    });
    promise.fail(function () {
      defer.reject();
    });
    return defer.promise();
  },
  // 告诉服务器加入该房间
  joinRoom: function () {
    var promise;
    this.inAndRoomParams.type = 1;
    if (this.roomInfo) {
      this.inAndRoomParams.channelId = this.roomInfo.channelId;
    }
    promise = this.inAndOutRoom.executeJSONP(this.inAndRoomParams);
    promise.done(function () {});
  },
  setRoomBgImg: function () {
    if (this.roomInfo && this.roomInfo.imageUrl) {
      this.roomBg.css('background', 'url(' + this.roomInfo.imageUrl + ')');
    }
  },
  // 右侧边栏切换
  asideChanged: function (e) {
    var target = $(e.target);
    var id = target.attr('data-id');
    target.parent().children().removeClass('active');
    target.addClass('active');
    $('.tab-content').hide();
    $('#' + id).show();
  },
  // 获取房间视频信息，以及节目单
  getLiveViedoList: function () {
    var self = this;
    var promise = this.liveVideoListModel.executeJSONP(_.extend({
      channelId: this.channelId,
      videoSize: 1000
    }, this.queryParams));
    promise.done(function (res) {
      if (res && ~~res.code === 0) {
        // 视频数据
        var show = res.data.channelShow;
        if (show) {
          var imGroupid = show.imGroupid;
          self.roomInfo.imGroupid = imGroupid;
          // if (user.isLogined()) {
          self.fetchUserIMSig(imGroupid);
          // }
          self.currentChannelShowStatus = self.currentChannelShowStatus || {};
          self.currentChannelShowStatus[show.id] = show.status;
          self.currentChannelShowId = show.id;

          var videoData = {
            videoType: 'FANPA_CHANNEL',
            status: 2,
            url: show.liveStream,
            videoStatus: show.status,
            beginTime: show.beginTime
          };
          self.setChannelStatusTip(show.status, show.beginTime);
          self.flashAPI.onReady(function () {
            this.init(videoData);
          });
        } else {
          uiConfirm.show({
            title: '进入房间失败',
            content: '该频道还没有节目，更多精彩，敬请期待',
            cancelBtn: false,
            okFn: function () {
              self.goBack();
            },
            cancelFn: function () {
              self.goBack();
            }
          });
        }
        // 节目单
        if (res.data && res.data.videos) {
          Backbone.trigger('event:ChannelLiveVideoListReady', {
            list: res.data.videos || [],
            now: res.now
          });
        }
      } else {
        uiConfirm.show({
          title: '进入房间失败',
          content: '获取节目单失败，小编努力安排中...',
          cancelBtn: false,
          okFn: function () {
            self.goBack();
          },
          cancelFn: function () {
            self.goBack();
          }
        });
      }
    });
  },
  setChannelStatusTip: function (status, time) {
    if (~~status === 2) {
      $('.channelLiveTip').text('').hide();
    } else {
      if (time) {
        var date = new Date(time);
        $('.channelLiveTip').show().text('本房间将在' + (date.getMonth() + 1) +
          '月' + date.getDate() + '日' + date.getHours() + ':' +
          (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
          '开始直播');
      }
    }
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
  }
});

module.exports = View;
