/**
 * Created by AaronYuan on 5/4/16.
 */

// var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View; // View的基类

var PlaybackModel = require('../../models/index/playback.model');
var UserModel = require('UserModel');
var DateTime = require('BusinessDate');
var user = UserModel.sharedInstanceUserModel();

var View = BaseView.extend({
  el: '#playbackListWrap', // 设置View对象作用于的根元素，比如id
  // rawLoader: function () { // 可用此方法返回字符串模版
  //   var template = require('../template/index');
  //   return template;
  // },
  clientRender: false,
  events: { // 监听事件
    'click .btnDataOrder': 'dataOrderClick'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {
    this.playbackParameter = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: user.getWebToken(),
      offset: 0,
      size: 15,
      order: 'TIME'
    };
  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.playbackModel = PlaybackModel.sigleInstance();

    this.itemTpl = this.$el.find('#itemTpl').text();
    this.playbackList = this.$el.find('#playbackList');
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    var self = this;
    this.currentPage = 1;
    this.getPageList(this.currentPage);

    $(document).on('scroll', function (e) {
      self.bodyScroll(e);
    });
  },
  initPagination: function () {
    var self = this;
    this.pageing = $('#pageWrap').paging(-1, {
      format: '[ < .(qq -) nnncnn (- pp)> ] ',
      perpage: 9,
      page: 1,
      onFormat: function (type) {
        switch (type) {
          case 'block':
            if (!this.active) {
              return '<span class="disabled ">' + this.value + '</span>';
            } else if (this.value !== this.page) {
              return '<a href="#' + this.value + '">' + this.value + '</a>';
            }
            return '<span class="current ">' + this.value + '</span>';
          case 'next':
            if (this.active) {
              return '<a href="#' + this.value + '" class="next ">&raquo;</a>';
            }
            return '<span class="disabled ">&raquo;</span>';
          case 'prev':
            if (this.active) {
              return '<a href="#' + this.value + '" class="prev ">&laquo;</a>';
            }
            return '<span class="disabled ">&laquo;</span>';
          case 'fill':
            if (this.active) {
              return '<span>...</span>';
            }
            return '';
          default:
            return '';
        }
      },
      onSelect: function (page) {
        self.getPageList(page);
      }
    });
  },
  getPageList: function (page) {
    var self = this;
    this.playbackParameter.offset = (page - 1) * 15;
    self.playbackModel.executeJSONP(this.playbackParameter, function (res) {
      self.renderList(res);
      if (!self.totalCount) {
        self.totalCount = res.data.totalCount;
      }
    }, function () {
    });
  },
  renderList: function (data) {
    var result = this.formatData(data);
    var html = this.compileHTML(this.itemTpl, result);
    this.playbackList.append(html);
  },
  formatData: function (data) {
    var time;
    var result;
    if (data) {
      _.each(data.data, function (item) {
        var curItem = item;
        time = new Date(item.startTime);
        result = DateTime.difference(item.duration);
        curItem.startTimeTxt = DateTime.format(time, 'yyyy/MM/dd');
        curItem.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
      });
    }
    return data;
  },
  dataOrderClick: function (e) {
    var ele = $(e.target);
    if (!ele.hasClass('btnDataOrder')) {
      ele = ele.parent('button');
    }
    $('.btnDataOrder').removeClass('active');
    ele.addClass('active');
    this.playbackParameter.order = ele.data('tag');
    this.playbackParameter.offset = 0;
    this.currentPage = 1;
    this.playbackList.children().remove();
    this.getPageList(1);
  },
  bodyScroll: function (e) {
    var target = $(e.target);
    var scrollTop = target.scrollTop();
    var wrapHeight = this.playbackList.height();
    var diff = scrollTop - wrapHeight;
    if (diff > -370) {
      this.currentPage++;
      this.getPageList(this.currentPage);
    }
  }
});

module.exports = View;
