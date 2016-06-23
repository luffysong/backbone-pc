/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-3-9
 * @author  YuanXuJia
 * @info 直播按钮控制
 */

'use strict';
var Backbone = require('backbone');
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var imServer = require('imServer');
var uiConfirm = require('ui.confirm');
var msgBox = require('ui.msgBox');
var StartLiveModel = require('../../models/anchor/start-live.model');
var EndLiveModel = require('../../models/anchor/end-live.model');
var FlashApi = require('FlashApi');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var BusinessDate = require('BusinessDate');

var View = BaseView.extend({
  el: '#liveShowBtnWraper', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/live-show-btn.html');
  },
  events: { // 监听事件
    'click .endLive': 'endLiveClick',
    'click .startLive': 'startLiveClick'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.startLiveModel = new StartLiveModel();
    this.endLiveModel = new EndLiveModel();

    this.startLiveParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      roomId: '',
      imGroupId: ''
    };

    this.endLiveParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      roomId: ''
    };
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.btnEndLive = $('.endLive');
    this.btnStartLive = $('.startLive');
    this.defineEventInterface();
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.FlashApi = FlashApi.sharedInstanceFlashApi({
      el: 'broadCastFlash'
    });
  },
  /**
   * 判断是否超过预播时间
   * @param time
   * @returns {number} 1: 超过1小时以上;  0:没有超时;  -1: 太早了
   */
  isTooLate: function (time) {
    var currentTime = new Date();
    var timeSpan = time - currentTime.getTime();
    var result = BusinessDate.difference(Math.abs(timeSpan));
    if (timeSpan < 0 && (result.hours >= 1 || result.day >= 1)) {
      return 1;
    } else if (timeSpan > 300000) {
      return -1;
    }
    return 0;
  },
  /**
   * 开启直播
   */
  startLiveClick: function (e) {
    var current = $(e.target);
    var self = this;
    var result = self.isTooLate(self.roomInfo.liveTime);
    var status = ~~self.roomInfo.status;

    if (status === 0) {
      msgBox.showTip('该直播尚未发布,无法开启直播!');
      return null;
    } else if (status === 1) {
      if (result === 1) {
        msgBox.showTip('您已经迟到超过一小时，无法再进行本场直播了');
        return null;
      }
    }
    if (current.hasClass('m_disabled')) {
      return null;
    }

    current.addClass('m_disabled');
    this.btnEndLive.removeClass('m_disabled');

    if (!this.roomInfo) {
      msgBox.showError('没有获取到房间信息');
      return '';
    }
    if (!this.roomInfo.imGroupid) {
      imServer.createIMChatRoom(function (res) {
        self.roomInfo.imGroupid = res.GroupId;
        self.startLive();
      }, function () {
        msgBox.showError('创建房间失败,请稍后重试');
      });
    } else {
      self.startLive();
    }
    return null;
  },
  /**
   * 开启直播
   */
  startLive: function () {
    var self = this;
    var msg;
    var promise;

    self.startLiveParams.roomId = self.roomInfo.id;
    self.startLiveParams.imGroupId = self.roomInfo.imGroupid;

    promise = self.startLiveModel.executeJSONP(this.startLiveParams);
    promise.done(function (result) {
      if (result && ~~result.code === 0) {
        msg = '您已成功开启直播，请复制下面的信息：</br>' +
          '视频连接：' + result.data.livePushStreamUrl +
          '</br>视频流：' + result.data.streamName;
        uiConfirm.show({
          title: '开启直播成功',
          content: msg,
          cancelBtn: false,
          okFn: function () {
            window.location.reload();
          },
          cancelFn: function () {
            window.location.reload();
          }
        });
        self.startFlash();
        Backbone.trigger('event:LiveShowStarted');
      } else {
        self.btnStartLive.removeClass('m_disabled');
        msgBox.showError(result.msg || '开启直播失败,请稍后重试');
      }
    });
    promise.fail(function (err) {
      msgBox.showError(err.msg || '开启直播失败,请稍后重试');
    });
  },

  startFlash: function () {
    var self = this;
    self.FlashApi.onReady(function () {
      //  this.addUrl(self.roomInfo.url, self.roomInfo.streamName);
      this.init(self.roomInfo);
    });
  },
  /**
   * 结束直播
   */
  endLiveClick: function () {
    var self = this;
    if (this.btnEndLive.hasClass('m_disabled')) {
      return null;
    }
    uiConfirm.show({
      title: '消息',
      content: '您确定要结束直播吗',
      okFn: function () {
        self.endLive();
        window.location.href = '/anchor-setting.html?view=history';
      },
      cancelFn: function () {}
    });
    return null;
  },
  /**
   * 点击结束直播
   */
  endLive: function () {
    var self = this;
    var promise;

    self.endLiveParams.roomId = self.roomInfo.id;
    promise = self.endLiveModel.executeJSONP(self.endLiveParams);
    promise.done(function () {
      self.btnEndLive.addClass('m_disabled');
      self.isLiveShowing = false;
      msgBox.showOK('结束直播操作成功');
      Backbone.trigger('event:liveShowEnded');
    });
    promise.fail(function (err) {
      msgBox.showError(err.msg || '操作失败,稍后重试');
    });
  },

  roomInfoReady: function (data) {
    if (data) {
      this.roomInfo = data;
      this.changeButtonStatus(this.roomInfo.status);
    }
  },
  defineEventInterface: function () {
    var self = this;
    // 成功获取房间信息
    Backbone.on('event:roomInfoReady', function (data) {
      self.roomInfoReady(data);
    });
  },
  changeButtonStatus: function (status) {
    var result = this.isTooLate(this.roomInfo.liveTime);
    if (result === 1) {
      this.btnStartLive.addClass('m_disabled');
      Backbone.trigger('event:stopLoopRoomInfo');
    } else if (result === 0) {
      this.btnStartLive.removeClass('m_disabled');
    }

    switch (status) {
      case 0:
        this.btnStartLive.addClass('m_disabled');
        this.btnEndLive.addClass('m_disabled');
        break;
      case 1:
        this.btnEndLive.addClass('m_disabled');
        break;
      case 2:
        this.btnStartLive.addClass('m_disabled').text('直播中');
        this.btnEndLive.removeClass('m_disabled');
        this.startFlash();
        break;
      case 3:
        this.btnStartLive.addClass('m_disabled');
        this.btnEndLive.addClass('m_disabled');
        break;
      default:
        break;
    }
  }
});

module.exports = View;
