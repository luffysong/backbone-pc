/**
 * 节目单
 */
'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;


var View = BaseView.extend({
  el: '#videoList',
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.itemTpl = require('./template/live-video-list-tpl.html');
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    this.defineEventInterface();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:ChannelLiveVideoListReady', function (data) {
      self.renderList(data.list);
      if (data.now) {
        self.selectedItem(data.now);
      }
      self.positionActiveVideo();
    });
    // 轮训
    Backbone.on('event:RoomLoopInfo', function (data) {
      if (data.now) {
        self.selectedItem(data.now);
      }
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  renderList: function (videos) {
    var html = this.compileHTML(this.itemTpl, {
      data: videos || []
    });
    this.$el.html(html);
    this.allItems = this.$el.children('div');
  },
  selectedItem: function (now) {
    if (this.allItems) {
      this.allItems.removeClass('active');
    }
    _.map(this.allItems, function (item) {
      var el = $(item);
      var start = el.data('start');
      var end = el.data('end');
      if (now >= start && now <= end) {
        el.addClass('active');
      }
    });
  },
  positionActiveVideo: function () {
    var k = 1;
    var m = 1;
    var h;
    var ah;
    var _ih = 0;
    _.map(this.allItems, function (item) {
      if ($(item).hasClass('item')) {
        k = k + 1;
        m = m + 1;
        _ih += $(item).height() + 20;
        if ($(item).hasClass('active')) {
          ah = $('.active').height();
          h = _ih + ah;
        }
      }
    });
    if (h > 662) {
      $('#videoList').scrollTop(h);
    }
  }
});

module.exports = View;
