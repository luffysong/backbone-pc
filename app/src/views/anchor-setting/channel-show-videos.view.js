/**
 * 频道节目单列表，视频列表
 */
'use strict';

var $ = require('jquery');
var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var ShowListModel = require('../../models/channel/get-channel-show-list.model');
var VideoListModel = require('../../models/channel/get-channel-show-videos.model');
var PublishShowModel = require('../../models/channel/publish-channel-show.model');
var DeleteShowModel = require('../../models/channel/delete-channel-show.model');

var msgBox = require('ui.msgBox');
var uiConfirm = require('ui.confirm');
// var BusinessDate = require('BusinessDate');

var View = BaseView.extend({
  el: '#channelShowVideosBlock',
  rawLoader: function () {
    return require('./template/channel-show-videos.html');
  },
  events: {
    'click #showListWrap': 'showItemClicked'
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
    this.showListModel = ShowListModel.sharedInstanceModel();
    this.videoListModel = VideoListModel.sharedInstanceModel();
    this.publishShowModel = PublishShowModel.sharedInstanceModel();
    this.deleteShowModel = DeleteShowModel.sharedInstanceModel();

    this.elements.showList = this.$el.find('#showListWrap');
    this.elements.videoList = this.$el.find('#videoListWrap');
    this.showItemTpl = require('./template/channel-show-item-tpl.html');
    this.videoItemTpl = require('./template/channel-show-video-item-tpl.html');
  },
  ready: function () {
    //  初始化
    this.defineEventInterface();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('evernt:channelSelected', function (info) {
      self.channelInfo = info;
      self.renderShowList();
    });
    // 有新的节目单被创建了
    Backbone.on('event:ChannelShowAdded', function () {
      self.renderShowList();
      self.renderVideoList({
        id: 0
      });
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  getShowList: function () {
    var defer = $.Deferred();
    this.showListModel.executeJSONP(_.extend({
      channelId: this.channelInfo.channelId,
      offset: 0,
      size: 10000
    }, this.queryParams)).done(function (res) {
      if (res) {
        defer.resolve(res.data);
      } else {
        defer.reject();
      }
    });
    return defer.promise();
  },
  getVideoList: function (id) {
    var defer = $.Deferred();
    this.videoListModel.executeJSONP(_.extend({
      showId: id,
      offset: 0,
      size: 1000
    }, this.queryParams)).done(function (res) {
      if (res && res.data) {
        defer.resolve(res.data);
      } else {
        defer.reject();
      }
    });
    return defer.promise();
  },
  createVideoListDom: function (data) {
    var html = this.compileHTML(this.videoItemTpl, {
      data: data
    });
    this.elements.videoList.html(html);
  },
  renderVideoList: function (showInfo) {
    this.getVideoList(showInfo.id).done(function (list) {
      this.createVideoListDom(list);
    }.bind(this)).fail(function () {
      this.createVideoListDom([]);
    }.bind(this));
  },
  createShowListDom: function (data) {
    var html = this.compileHTML(this.showItemTpl, {
      data: data || []
    });
    this.elements.showList.html(html);
  },
  renderShowList: function () {
    this.getShowList().done(function (data) {
      this.createShowListDom(data);
    }.bind(this)).fail(function () {
      this.createShowListDom([]);
    }.bind(this));
  },
  showItemClicked: function (e) {
    var target = $(e.target);
    var tr = target.parents('tr');
    var data = {
      id: tr.data('showid'),
      name: tr.data('showname')
    };
    var action = target.data('action');
    if (action) {
      this.showItemButtonClicked(action, data);
      return false;
    }
    this.showItemRowClicked(tr, data);
    return true;
  },
  showItemButtonClicked: function (action, data) {
    console.log(action);
    var self = this;
    if (action === 'publish') {
      console.log(23);
    } else if (action === 'delete') {
      uiConfirm.show({
        content: '您确定要删除:<b>' + data.name + '</b>吗?',
        okFn: function () {
          self.deleteShow(data);
        }
      });
      // this.deleteShow(data);
    }
  },
  showItemRowClicked: function (tr, data) {
    var trs = tr.parent().children();
    trs.removeClass('am-active');
    tr.addClass('am-active');
    // Backbone.trigger('event:ChannelShowItemSelected', data);
    this.renderVideoList(data);
  },
  // 删除节目单
  deleteShow: function (data) {
    var self = this;
    this.deleteShowModel.executeJSONP(_.extend({
      channelId: this.channelInfo.channelId,
      showId: data.id
    }, this.queryParams)).done(function (res) {
      if (res && res.code === '0') {
        msgBox.showOK('成功删除该节目单');
        self.$el.find('tr[data-showid="' + data.id + '"]').remove();
        // if( $('tr[class="am-active"]'))
        self.renderVideoList({
          id: 0
        });
      } else {
        msgBox.showError(res.msg || '删除节目单失败，稍后重试');
      }
    });
  },
  // 发布节目单
  publishShow: function () {}
});

module.exports = View;
