'use strict';

var Backbone = require('backbone');
var base = require('base-extend-backbone');
var BaseView = base.View;
var profileTemp = require('./template/profile.html');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var View = BaseView.extend({
  el: '#settingProfile',
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    var data = imModel.get('data');
    this.data = {
      nickName: data.nickName,
      bigheadImg: data.largeAvatar,
      anchor: data.anchor
    };
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.elements = {};
  },
  ready: function () {
    //  初始化
    this.initRender();
    this.defineEventInterface();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  initRender: function () {
    var profileHTML = this.compileHTML(profileTemp, this.data);
    this.$el.html(profileHTML);
    this.elements.nickName = this.findDOMNode('#nickName');
    this.elements.headAvatar = this.findDOMNode('#headAvatar');
    this.elements.tagsWrap = this.findDOMNode('#tagsWrap');
  },

  partialRender: function (data) {
    this.elements.nickName.text(data.nickName);
    this.elements.headAvatar.attr('src', data.headImg);
    var html = '';
    var tags = data.tags || {};
    for (var item in tags) {
      if (Object.hasOwnProperty(item)) {
        html += '<span>' + tags[item] + '</span>';
      }
    }
    this.elements.tagsWrap.html(html);
  },
  /**
   * 定义对外公布的事件
   */
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:userProfileChanged', function (data) {
      self.partialRender(data);
    });
  }
});

module.exports = View;
