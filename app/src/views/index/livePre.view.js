'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var livePreviewTemp = require('./template/index/live-pre.html');
var LivePreviewModel = require('../../models/index/live-pre.model');
var PushLarityModel = require('../../models/index/push-larity.model');
var UserInfoModel = require('../../models/anchor/anchor-info.model');
var MsgBox = require('ui.MsgBox');
var UserModel = require('UserModel');
var uiConfirm = require('ui.Confirm');
var user = UserModel.sharedInstanceUserModel();

var View = BaseView.extend({
  el: '#livePreview',
  events: {
    'click .box-praise': 'pushLiveVideo'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.livePreviewParameter = {
      deviceinfo: '{"aid":"30001001"}',
      size: 6
    };
    this.pushLarityParameter = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: '',
      type: 2,
      roomId: ''
    };
    this.userInfoParameter = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: ''
    };
    if (user.isLogined()) {
      this.pushLarityParameter.access_token = 'web-' + user.getToken();
    }
    this.totalMarks = '';
    this.isNeedPopup = true;
    this.roomId = '';
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.parentNode = this.$el.parent();
  },
  ready: function (options) {
    //  初始化
    var self = this;
    this.liveModel = new LivePreviewModel();
    this.pushModel = new PushLarityModel();
    this.userInfo = new UserInfoModel();
    this.topbar = options.topbar;
    this.liveModel.executeJSONP(this.livePreviewParameter, function (response) {
      var code = ~~response.code;
      if (code) {
        MsgBox.showError(response.msg);
      } else {
        self.livePreRender(response.data);
      }
    }, function (e) {
      if (e) {
        MsgBox.showError('获取数据错误');
      }
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  livePreRender: function (items) {
    var html;
    var le = items.length;
    var u = 6;
    if (le <= 3) {
      u = 3;
    } else {
      if (le < 6) {
        u = 6;
      }
    }
    while (le < u) {
      le++;
      items.push({
        completion: 1
      });
    }
    html = this.compileHTML(livePreviewTemp, { items: items });
    this.parentNode.css({
      height: 590 / (6 / u)
    });
    this.$el.html(html);
  },
  pushLiveVideo: function (e) {
    var self;
    var el;
    var status;
    if (user.isLogined()) {
      //  已经登录
      self = this;
      el = $(e.currentTarget);
      this.pushLarityParameter.roomId = el.attr('data-id');
      status = el.attr('data-status');
      if (this.isNeedPopup) {
        this.userInfoParameter.access_token = 'web-' + user.getToken();
        this.userInfo.executeJSONP(this.userInfoParameter, function (response) {
          var code = parseInt(response.code, 10);
          if (code === 0) {
            self.totalMarks = response.data.totalMarks;
            self.showConfirm();
          } else {
            MsgBox.showError(response.msg || '操作失败,稍后重试');
          }
        }, function () {
          MsgBox.showError('获取信息失败');
        });
      } else {
        self.executePushVideo();
      }
    } else {
      //  未登录
      this.topbar.on('logined', function () {
        window.location.reload();
      });
      this.topbar.showLoginDialog();
    }
  },
  showConfirm: function () {
    var self = this;
    var content =
        '<div>使用20积分支持一下MC,当前共有' + (this.totalMarks || 0) + '积分</div> '
        + '<div style="text-align:right;">'
        + '<label><input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
    uiConfirm.show({
      title: '顶上去',
      content: content,
      okFn: function () {
        var check = $('#popupCheckBox');
        if (check.is(':checked')) {
          self.isNeedPopup = false;
        } else {
          self.isNeedPopup = true;
        }
        self.executePushVideo();
      }
    });
  },
  executePushVideo: function () {
    this.pushModel.executeJSONP(this.pushLarityParameter, function (response) {
      var success = response.data.success;
      if (!success) {
        MsgBox.showError(response.data.message || '操作失败,请稍后重试');
      } else {
        MsgBox.showOK('感谢您的大力支持~');
      }
    }, function (e) {
      if (e) {
        MsgBox.showError('人气上推错误');
      }
    });
  }
});

module.exports = View;
