/*
 站子频道
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var ChannelModel = require('../../models/index/channel.model');

var View = BaseView.extend({
  el: '.fan-channel-wrap',
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
      size: 8,
      type: 'YYT'
    };
    this.channelModel = new ChannelModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node

    // item模板
    this.channelItemTpl = this.$el.find('#fanChannelItemTpl').html();
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
    var promise = this.channelModel.executeJSONP(this.queryParams);

    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        html = self.compileHTML(self.channelItemTpl, res);

        self.$el.find('.fan-list').html(html);
      }
    });
  }
});

module.exports = View;
