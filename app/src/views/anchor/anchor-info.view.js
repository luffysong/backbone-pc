/*
 clientRender:{bool} // 默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类
var _ = require('underscore');

var View = BaseView.extend({
  el: '#currentAnchorInfo', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/info.html');
  },
  events: { // 监听事件

  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.infoTpl = require('./template/room-info-tpl.html');
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    var el = this.$el;
    this.roomInfoWrap = el.find('#roomInfoWrap');
    this.imgRoomPic = el.find('#imgRoomPic');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.defineEventInterface();
  },
  defineEventInterface: function () {
    var self = this;
    var tpl;
    var html;
    Backbone.on('event:roomInfoReady', function (data) {
      if (data) {
        tpl = _.template(self.infoTpl);
        html = tpl(data);
        self.roomInfoWrap.append(html);
        self.txtOnline = $('#txtOnline');
        if (data.creator.smallAvatar) {
          self.imgRoomPic.attr('src', data.creator.smallAvatar);
        }
      }
    });
    Backbone.on('event:updateRoomInfo', function (data) {
      if (data) {
        self.txtOnline.text(data.currentOnline);
      }
    });
  }
});

module.exports = View;
