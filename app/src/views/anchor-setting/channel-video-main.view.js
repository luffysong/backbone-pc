/**
 * 频道节目单管理
 */
'use strict';

var Backbone = window.Backbone;
var $ = require('jquery');
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var ChannelListModel = require('../../models/channel/my-channel-list.model');

var CreatePlayListView = require('./create-channel-video.view');
var ChannelShowVideosView = require('./channel-show-videos.view');


var View = BaseView.extend({
  el: '#tabChannel',
  rawLoader: function () {
    return require('./template/channel-video-main.html');
  },
  events: {
    'change #channelSelect': 'selectChanged'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.elements = {};
    this.queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.channelListModel = new ChannelListModel();
    this.elements.channelSelect = this.$el.find('#channelSelect');
    this.optionTpl = '{{each data as item}}<option value="{{item.channelId}}">' +
      '{{item.channelName}}</option>{{/each}}';
  },
  ready: function () {
    //  初始化
    this.defineEventInterface();
    this.createView = new CreatePlayListView();
    this.showVideoView = new ChannelShowVideosView();

    this.renderPage();
  },
  defineEventInterface: function () {},
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 获取频道列表数据
  getChannelList: function () {
    var defer = $.Deferred();
    var promise = this.channelListModel.executeJSONP(_.extend({
      size: 1000,
      offset: 0
    }, this.queryParams));
    promise.done(function (res) {
      if (res) {
        defer.resolve(res.data);
      } else {
        defer.reject();
      }
    });
    promise.fail(function () {
      defer.reject();
    });
    return defer.promise();
  },
  renderData: function (data) {
    var html = this.compileHTML(this.optionTpl, {
      data: data
    });
    this.elements.channelSelect.append(html);
  },
  renderPage: function () {
    var self = this;
    this.getChannelList().done(function (data) {
      self.renderData(data);
    }).fail(function () {
      self.renderData([]);
    });
  },
  selectChanged: function () {
    var target = this.elements.channelSelect.find(':selected');
    var val = target.val();
    var text = target.text();
    Backbone.trigger('evernt:channelSelected', {
      channelId: val,
      channelName: text
    });
  }
});

module.exports = View;
