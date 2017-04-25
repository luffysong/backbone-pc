/*
 官方频道
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var _ = require('underscore');

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var ChannelModel = require('../../models/index/channel.model');

var View = BaseView.extend({
  el: '.official-wrap',
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
      size: 5,
      type: 'YYT'
    };

    this.asideTpl = require('./template/offical-aside-tpl.html');
    // this.$el.find('#officialAsideTpl').html();
    this.centerTpl = this.$el.find('#officialCenterTpl').html();

    this.channelModel = new ChannelModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.wrapDOM = this.$el.find('#officialList');
    // 模板
    this.emptyItem = {
      channelId: 0,
      channelType: 'YYT',
      channelName: '敬请期待',
      desc: '敬请期待',
      posterPic: '',
      popularity: 0,
      creator: {
        largeAvatar: '',
        nickName: ''
      }
    };
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
    var wrap = this.$el.find('#officialList');
    var len = 0;
    var list = [];
    wrap.children().remove();
    wrap.html('');
    var promise = this.channelModel.executeJSONP(this.queryParams);

    promise.done(function (res) {
      if (res && res.data && res.msg === 'SUCCESS') {
        len = 5 - ~~res.data.length;
        self.hideOfficialBlock(~~res.data.length);
        list = res.data;
        while (len-- > 0) {
          list.push(_.extend({}, self.emptyItem));
        }
        // self.bindAside(res.data.slice(1, 3));
        // self.bindCenter(res.data[0]);
        // self.bindAside(res.data.slice(3));
        self.bindAside(list.slice(1, 3));
        self.bindCenter(list[0]);
        self.bindAside(list.slice(3));
      }
    });
  },
  hideOfficialBlock: function (len) {
    if (len < 5) {
      $('.official-wrap').hide();
    }
  },
  bindAside: function (arr) {
    var html = this.compileHTML(this.asideTpl, {
      data: arr
    });
    this.wrapDOM.append(html);
  },
  bindCenter: function (data) {
    var html = this.compileHTML(this.centerTpl, data);
    this.wrapDOM.append(html);
  }
});

module.exports = View;
