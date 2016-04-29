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
var profileTemp = require('../../template/anchor-setting/profile.html');
var userCard = require('../../template/anchor-setting/user-card.html');
var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var UserInfoModel = require('../../model/anchor/anchor-info.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();


var View = BaseView.extend({
  el: '#settingProfile', //设置View对象作用于的根元素，比如id
  events: { //监听事件

  },
  rawLoader: function () {
  },
  //当模板挂载到元素之前
  beforeMount: function () {
    this.data = {
      'nickName': imModel.$get('data.nickName'),
      'bigheadImg': imModel.$get('data.largeAvatar'),
      'anchor': imModel.$get('data.anchor')
    };
    this.userInfoModel = UserInfoModel.sigleInstance();
    this.userInfo = {};
  },
  //当模板挂载到元素之后
  afterMount: function () {
    this.elements = {};
  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {


    this.initRender();
    this.defineEventInterface();
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
      this.userInfoModel.executeJSONP({
        deviceinfo: '{"aid": "30001001"}',
        access_token: user.getWebToken()
      }, function (res) {
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
    for (var item in data.tags) {
      html += '<span>' + data.tags[item] + '</span>';
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
