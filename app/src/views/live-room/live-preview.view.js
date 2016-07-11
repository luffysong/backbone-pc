/**
 * 预告
 */
'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;

var BusinessDate = require('BusinessDate');

var View = BaseView.extend({
  el: '.channel-live-pre-wrap',
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.elements = {};
    this.startTime = new Date('2016-06-13 13:14:33');
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.elements.day = this.$el.find('#day');
    this.elements.hour = this.$el.find('#hour');
    this.elements.minutes = this.$el.find('#minutes');
  },
  ready: function () {
    //  初始化
    this.hideDom();
    this.defineEventInterface();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:roomInfoReady', function (roomInfo) {
      if (roomInfo.status === 1) {
        self.$el.show();
        self.startTime = roomInfo.liveTime || new Date(roomInfo.now || '2016-06-13 13:14:33');
        self.setTime();
      } else {
        self.$el.hide();
      }
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  hideDom: function () {
    $('#btnShare').hide();
  },
  setTime: function () {
    var self = this;
    var cur = new Date();
    var diff = new Date(this.startTime) - cur;
    if (diff > 0) {
      var result = BusinessDate.difference(diff);
      if (result) {
        this.elements.day.text(result.day);
        this.elements.hour.text(result.hours);
        this.elements.minutes.text(result.minutes);
        setTimeout(function () {
          self.setTime();
        }, 60 * 1000);
      }
    } else if (diff === 0) {
      window.location.reload();
    }
  }
});

module.exports = View;
