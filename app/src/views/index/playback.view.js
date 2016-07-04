'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var playbackTemp = require('./template/playback.html');
var PlaybackModel = require('../../models/index/playback.model');
var msgBox = require('ui.msgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var space = require('../../../images/index/space.png');

var View = BaseView.extend({
  el: '#playbackVideo',
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.playbackParameter = {
      deviceinfo: '{"aid":"30001001"}',
      offset: 0,
      size: 6
    };
    var token = user.getToken();
    if (token) {
      this.playbackParameter.access_token = 'web-' + token;
    }
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    var _this = this;
    this.playbackModel = new PlaybackModel();
    this.parentNode = this.$el.parent();
    var promise = this.playbackModel.executeJSONP(this.playbackParameter);
    promise.done(function (response) {
      var code = ~~response.code;
      if (code) {
        msgBox.showError(response.msg);
      } else {
        _this.playbackRender(response.data);
      }
    });
    promise.fail(function () {
      msgBox.showError('请求错误');
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  playbackRender: function (items) {
    var le = items.length;
    var u = 6;
    if (le <= 3) {
      u = 3;
    } else {
      if (le < 6) {
        u = 6;
      }
    }
    while (le < u) {
      le++;
      items.push({
        completion: 1,
        imageUrl: space
      });
    }
    var html = this.compileHTML(playbackTemp, { items: items });
    var points = 6 / u;
    this.parentNode.css({
      height: 590 / points
    });
    this.$el.html(html);
  }
});

module.exports = View;
