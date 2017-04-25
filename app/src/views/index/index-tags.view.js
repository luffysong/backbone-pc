'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var TagsModel = require('../../models/index/index-tags.model');
var TagsListModel = require('../../models/index/index-tags-video.model');
var UserInfoModel = require('../../models/anchor/anchor-info.model');
var IndexBgrModel = require('../../models/index/index-background.model');
var PushLarityModel = require('../../models/index/push-larity.model');

var confirm = require('ui.confirm');
var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: 'body',
  rawLoader: function () {
    return '';
  },
  events: {
    'click #tagHtml': 'pushClicked'
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
    this.queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      size: 4,
      offset: 0
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
    this.tags = new TagsModel();
    this.userInfo = new UserInfoModel();
    this.pushModel = new PushLarityModel();
    this.tagsList = new TagsListModel();
    this.indexBgr = new IndexBgrModel();
    // download\this.tagsArr = [];
    // this.tagTpl = this.$el.find('#tagTpl').html();
    this.tagTpl = require('./template/tags.html');
    this.tagListTpl = require('./template/tags-list.html');
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function (ops) {
    //  初始化
    this.topbar = ops.topbar;
    this.renderTags();
    // this.renderIndexbackground();
  },
  renderIndexbackground: function () {
    var p = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      imageType: 1,
      size: 4,
      offset: 0
    };
    var promise = this.indexBgr.executeJSONP(p);
    promise.done(function (res) {
      if (res.data[0].imageUrl) {
        $('#topContainer').css('background', 'url(' + res.data[0].imageUrl + ')')
        .css('background-size', '100% 100%')
        .css('background-repeat', 'no-repeat')
        .css('background-position', 'center');
      }
      console.log('背景', res);
    });
  },
  renderTags: function () {
    var tagQueryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      size: 8,
      offset: 0
    };
    var self = this;
    var html;
    // var tagsArr = [];
    var promise = this.tags.executeJSONP(tagQueryParams);
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        var len = res.data.length;
        html = self.compileHTML(self.tagTpl, res);
        self.$el.find('#tagHtml').html(html);
        for (var i = len; i--;) {
          self.renderTagsList(res.data[i].id, res.data[i].title, res.data[i].rank);
        }
      }
    });
  },
  renderTagsList: function (tagId, title, rank) {
    var self = this;
    var queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      size: 8,
      offset: 0,
      tagId: tagId,
      rank: rank
    };
    var html;
    var promise = this.tagsList.executeJSONP(queryParams);
    promise.done(function (res) {
      html = self.compileHTML(self.tagListTpl, res);
      self.$el.find('#' + tagId + '-tags').html(html);
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
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
