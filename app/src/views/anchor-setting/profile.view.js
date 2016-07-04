// 顶部用户信息
'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;
var profileTemp = require('./template/profile.html');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var UserInfoModel = require('../../models/anchor/anchor-info.model');

var View = BaseView.extend({
  el: '.userInfoWrap',
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
  findDom: function () {
    var el = this.$el;
    this.elements.nickName = el.find('#nickName');
    this.elements.headAvatar = el.find('#headAvatar');
    this.elements.tagsWrap = el.find('#tagsWrap');
    this.elements.createCount = el.find('#createCount');
    this.elements.watchedLiveCount = el.find('#txtLive');
    this.elements.totalCredits = el.find('#txtScore');
    this.elements.fanTicket = el.find('#txtTicket');
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
    var self = this;
    var profileHTML;
    profileHTML = this.compileHTML(profileTemp, this.data);
    this.$el.html(profileHTML);
    this.findDom();
    var promise = this.userInfoModel.executeJSONP({
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    });
    promise.done(function (res) {
      self.bindUserInfo(res);
    });
  },
  bindUserInfo: function (res) {
    var self = this;
    self.data.gender = res.data.sex || '';
    self.data.bigheadImg = res.data.largeAvatar || '';
    self.elements.watchedLiveCount.text(res.data.userCount.viewCount || 0);
    self.elements.totalCredits.text(res.data.totalMarks || 0);
    self.elements.fanTicket.text(0);
    // Backbone.trigger('event:setThemeBgImg', res.data.userProfile.bgTheme || '');
  },
  partialRender: function (data) {
    this.elements.nickName.text(data.nickName);
    this.elements.headAvatar.attr('src', data.headImg);
    var html = '';
    _.each(data.tags, function (item) {
      html += '<span>' + item + '</span>';
    });
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
