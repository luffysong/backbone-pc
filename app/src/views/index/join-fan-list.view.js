/*
 入驻站子
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var FanUserModel = require('../../models/index/fan-user.model');

var View = BaseView.extend({
  el: '.fan-wrap',
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.queryParams = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      size: 12,
      offset: 0
    };

    this.fanUserModel = new FanUserModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node

    this.joinFanItemTpl = this.$el.find('#joinFanListTpl').html();
  },
  ready: function () {
    //  初始化

    this.renderList();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  renderList: function () {
    var self = this;
    var html;
    var promise = this.fanUserModel.executeJSONP(this.queryParams);
    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        html = self.compileHTML(self.joinFanItemTpl, res);

        self.$el.find('.join-fan-wrap').html(html);
      }
    });
  }
});

module.exports = View;
