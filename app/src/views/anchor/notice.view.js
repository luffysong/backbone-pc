/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-3-9
 * @author YuanXuJia
 * @info 公告模块
 */

'use strict';
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var Backbone = window.Backbone;

var NoticeModel = require('../../models/anchor/notice-create.model');
var NoticeGetModel = require('../../models/anchor/notice-get.model');
var imServer = require('imServer');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: '#noticeWraper', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/notice.html');
  },
  events: { // 监听事件
    'click #btnEditNotice': 'editClickHandler',
    'click .closeNoticePanel': 'panelDisplay',
    'click #btnSubmitNotice': 'submitClickHandler',
    'keyup #txtNotice': 'noticeChanged'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.noticeModel = new NoticeModel();
    this.noticeGetModel = new NoticeGetModel();
    this.noticeInfo = {
      content: ''
    };

    this.noticeInfoParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      roomId: '',
      content: ''
    };

    this.noticeGetParams = {
      deviceinfo: '{"aid":"30001001"}',
      roomId: '',
      access_token: user.getWebToken()
    };
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    // 修改公告弹出框
    this.editNoticPanel = $('#editNoticPanel');
    this.noticeWrap = $('#noticeWrap');
    // 公告内容
    this.txtNotice = $('#txtNotice');
    this.imgRoomPic = $('#imgRoomPic');
    this.errNoticeTip = $('#errNoticeTip');

    this.tipTextarea = this.$el.find('.tipTextarea');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.defineEventInterface();
  },
  /**
   * 编辑按钮点击
   */
  editClickHandler: function () {
    this.noticeChanged();
    this.panelDisplay(true);
  },
  /**
   * 编辑公告悬浮框控制
   * @param isShow
   */
  panelDisplay: function (isShow) {
    this.errNoticeTip.text('');
    if (isShow === true) {
      this.txtNotice.val(this.noticeInfo.content);
      this.editNoticPanel.show();
    } else {
      this.editNoticPanel.hide();
    }
  },
  /**
   * 提交公告
   */
  submitClickHandler: function () {
    var content = this.txtNotice.val().trim();
    var self = this;
    var promise;
    if (!content || content.length > 50 || content.length <= 0) {
      this.errNoticeTip.text('公告文字请在50字以内');
      return null;
    }

    this.noticeInfoParams.roomId = this.roomInfo.id;
    this.noticeInfoParams.content = content;

    promise = this.noticeModel.executeJSONP(this.noticeInfoParams);
    promise.done(function (res) {
      if (res && res.code === '0') {
        Backbone.trigger('event:noticeChanged', content);
        self.noticeInfo.content = content;
        self.noticeWrap.text(content);
        self.panelDisplay();
        msgBox.showOK('公告发布成功');
        self.sendNotifyToIM(content);
      }
    });
    promise.fail(function () {
      msgBox.showError('数据保存失败,请稍后重试');
    });
    return null;
  },
  sendNotifyToIM: function (content) {
    if (!this.roomInfo.imGroupid) {
      return;
    }
    imServer.sendMessage({
      groupId: this.roomInfo.imGroupid,
      msg: {
        roomId: this.roomInfo.id,
        smallAvatar: '',
        msgType: 2,
        content: content
      }
    }, function () {}, function () {});
  },
  /**
   * 定义事件
   */
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        self.roomInfo = data;
      }
      self.getNoticeInfo();
      //  if (data.imageUrl) {
      //      self.imgRoomPic.attr('src', data.imageUrl);
      //  }
    });
  },
  /**
   * 获取公告信息
   */
  getNoticeInfo: function () {
    var self = this;
    var notice = null;
    var promise;

    this.noticeGetParams.roomId = this.roomInfo.id;

    promise = this.noticeGetModel.executeJSONP(this.noticeGetParams);
    promise.done(function (res) {
      if (res && res.data) {
        if (res.data.placards) {
          notice = res.data.placards[0];
        }
        if (notice) {
          self.noticeInfo = notice;
          self.noticeWrap.text(notice.content || '暂无公告');
          self.txtNotice.val(notice.content);
        } else {
          self.noticeWrap.text('暂无公告');
        }
      }
    });
    promise.fail(function (err) {
      msgBox.showError(err.msg || '获取公告失败');
    });
  },
  noticeChanged: function () {
    this.tipTextarea.find('.red').text(50 - this.txtNotice.val().length);
    // if (this.txtNotice.val().length < 50) {
    //   this.tipTextarea.text('您还可以输入' + (50 - this.txtNotice.val().length) + '个字');
    // } else {
    //   this.tipTextarea.text('您的输入超出了' + (this.txtNotice.val().length - 50) + '个字');
    // }
  }
});

module.exports = View;
