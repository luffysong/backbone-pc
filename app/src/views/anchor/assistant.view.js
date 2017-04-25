'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var _ = require('underscore');

var View = BaseView.extend({
  el: '',
  rawLoader: function () {
    return '';
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.chatHistory = $('#chatHistory');
    this.liveShowBtnWraper = $('#liveShowBtnWraper');
    this.btnFieldControl = $('#btnFieldControl');
    this.btnEditBgTheme = $('.edit_bg_btn');
    this.btnEditNotice = $('#btnEditNotice');
  },
  ready: function (ops) {
    //  初始化
    this.options = _.extend({}, ops);
    this.renderPage();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  renderPage: function () {
    if (this.options.assistant) {
      // 控制聊天列表高度
      this.chatHistory.height(389);
      // 隐藏直播控制模块
      this.liveShowBtnWraper.hide();
      // 隐藏场控控制按钮
      this.btnFieldControl.hide();
      // 隐藏编辑主题按钮
      this.btnEditBgTheme.hide();
      // 隐藏编辑公告按钮
      this.btnEditNotice.hide();
    }
  }
});

module.exports = View;
