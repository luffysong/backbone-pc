'use strict';

var Backbone = require('backbone');
var base = require('base-extend-backbone');
var BaseView = base.View;
var profileTemp = require('./template/profile.html');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var UserInfoModel = require('../../models/anchor/anchor-info.model');
var userCard = require('./template/user-card.html');

var View = BaseView.extend({
  el: '#settingProfile',
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    var data = imModel.get('data');
    this.data = {
      nickName: data.nickName,
      bigheadImg: data.largeAvatar,
      anchor: data.anchor
    };
    this.userInfoModel = UserInfoModel.sharedInstanceModel();
    this.userInfo = {};
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.elements = {};
  },
  ready: function () {
    //  初始化
    this.initRender();
    this.defineEventInterface();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  initRender: function () {
    var el = this.$el;
    var self = this;
    var profileHTML;
    if (imModel.isAnchor()) {
      profileHTML = this.compileHTML(profileTemp, this.data);
      this.$el.html(profileHTML);

      this.elements.nickName = el.find('#nickName');
      this.elements.headAvatar = el.find('#headAvatar');
      this.elements.tagsWrap = el.find('#tagsWrap');
    } else {
      var promise = this.userInfoModel.executeJSONP({
        deviceinfo: '{"aid": "30001001"}',
        access_token: user.getWebToken()
      });
      promise.done(function (res) {
        self.bindUserInfo(res);
      });
    }
  },
  bindUserInfo: function (res) {
    var self = this;
    var el = this.$el;
    var profileHTML;
    self.data.gender = res.data.sex || '';
    self.data.bigheadImg = res.data.largeAvatar || '';
    profileHTML = self.compileHTML(userCard, self.data);
    self.$el.html(profileHTML);

    self.elements.watchedLiveCount = el.find('#txtLive');
    self.elements.totalCredits = el.find('#txtScore');
    self.elements.fanTicket = el.find('#txtTicket');

    self.elements.watchedLiveCount.text(res.data.userCount.viewCount || 0);
    self.elements.totalCredits.text(res.data.totalMarks || 0);
    self.elements.fanTicket.text(0);
  },
  partialRender: function (data) {
    this.elements.nickName.text(data.nickName);
    this.elements.headAvatar.attr('src', data.headImg);
    var html = '';
    var tags = data.tags || {};
    for (var item in tags) {
      if (Object.hasOwnProperty(item)) {
        html += '<span>' + tags[item] + '</span>';
      }
    }
    this.elements.tagsWrap.html(html);
  },
  /**
   * 定义对外公布的事件
   */
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:userProfileChanged', function (data) {
      self.partialRender(data);
    });
  }
});

module.exports = View;
