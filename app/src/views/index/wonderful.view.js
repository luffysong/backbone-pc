/*
 精彩饭趴
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var LivePreviewModel = require('../../models/index/live-pre.model');
var UserInfoModel = require('../../models/anchor/anchor-info.model');
var PushLarityModel = require('../../models/index/push-larity.model');

var confirm = require('ui.confirm');
var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: '.perfect-wrap',
  clientRender: false,
  events: {
    'click #wonderfulList': 'pushClicked'
  },
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    // 总积分
    this.totalMarks = '';
    // 是否需要再次弹出提示层
    this.isNeedPopup = true;
    // 列表项模板
    this.wonderfulItemTpl = this.$el.find('#wonderfulItemTpl').html();

    this.livePreviewModel = new LivePreviewModel();
    this.userInfo = new UserInfoModel();
    this.pushModel = new PushLarityModel();

    this.queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      size: 8,
      order: 'POPULARITY' // TIME
    };

    this.pushLarityParameter = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      type: 2,
      roomId: ''
    };
    this.userInfoParameter = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken()
    };
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function (ops) {
    this.topbar = ops.topbar;
    //  初始化
    this.renderList();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 渲染列表
  renderList: function () {
    var html;
    var self = this;
    var promise = this.livePreviewModel.executeJSONP(this.queryParams);

    promise.done(function (res) {
      html = self.compileHTML(self.wonderfulItemTpl, res);
      self.$el.find('#wonderfulList').html(html);
    });
  },
  pushClicked: function (e) {
    var el = $(e.target);
    if (!el.hasClass('am-btn')) {
      el = el.parent('button');
    }
    if (el.attr('data-roomId')) {
      this.currentItemDom = el.parents('.item');
      this.pushViedo(el.attr('data-roomId'));
    }
  },
  // 视频点赞
  pushViedo: function (roomId) {
    var self = this;
    var promise;
    if (user.isLogined()) {
      //  已经登录
      this.pushLarityParameter.roomId = roomId;
      if (this.isNeedPopup) {
        promise = this.userInfo.executeJSONP(this.userInfoParameter);
        promise.done(function (response) {
          var code = parseInt(response.code, 10);
          if (code === 0) {
            self.totalMarks = response.data.totalMarks;
            self.showConfirm();
          } else {
            msgBox.showError(response.msg || '操作失败,稍后重试');
          }
        });
        promise.fail(function () {
          msgBox.showError('获取信息失败');
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
      '<div>使用<span style="color:#ff6f6e;">20</span>积分支持一下MC,当前共有<span style="color:#ff6f6e;">' +
      (this.totalMarks || 0) + '</span>积分</div> ' +
      '<div style="text-align:right;">' +
      '<label style="ont-weight: inherit;">' +
      '<input value="1" id="popupCheckBox" type="checkbox">&nbsp;别再烦我</label></div>';
    confirm.show({
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
    var self = this;
    var promise = this.pushModel.executeJSONP(this.pushLarityParameter);
    promise.done(function (response) {
      var success = response.data.success;
      if (!success) {
        msgBox.showError(response.data.message || '操作失败,请稍后重试');
      } else {
        msgBox.showOK('感谢您的大力支持~');
        self.updateNumber();
      }
    });
    promise.fail(function (xhr) {
      if (xhr) {
        msgBox.showError('人气上推错误');
      }
    });
  },
  updateNumber: function () {
    var target = this.currentItemDom.find('.white');
    if (target) {
      var txt = target.text();
      // 积分
      target.text(~~txt + 20);
    }
  }
});

module.exports = View;
