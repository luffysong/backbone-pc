'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var recommendTemp = require('./template/recommend.html');
var RecommendModel = require('../../models/index/recommended.model');
var msgBox = require('ui.msgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var FlashApi = require('FlashApi');
var View = BaseView.extend({
  el: '#topContainer',
  events: {
    'click .go-livehome': 'gotoLiveHome'
  },
  context: function () {
    // console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.recommendParameter = {
      deviceinfo: '{"aid":"30001001"}'
    };
    var token = user.getToken();
    if (token) {
      this.recommendParameter.access_token = 'web-' + user.getToken();
    }
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    var self = this;
    this.recommendModel = new RecommendModel();
    var promise = this.recommendModel.executeJSONP(this.recommendParameter);
    promise.done(function (response) {
      var code = ~~response.code;
      if (!code) {
        self.recommendRender(response.data[0]);
      }
    });
    promise.fail(function () {
      msgBox.showError('获取数据错误');
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  recommendRender: function (data) {
    var status = data.status;
    var flashData = data;
    var html = this.compileHTML(recommendTemp, { data: data });
    this.$el.html(html);
    if (status === 3 || status === 2) {
      this.FlashApi = FlashApi.sharedInstanceFlashApi({
        el: 'topFlash',
        props: {
          width: 1014,
          height: 570
        }
      });
    }
    if (this.FlashApi) {
      this.FlashApi.onReady(function () {
        flashData.isIndex = true;
        this.init(flashData);
      });
    }
  },
  gotoLiveHome: function (e) {
    var el = $(e.currentTarget);
    var id = el.attr('data-id');
    var status = ~~(el.attr('data-status'));
    switch (status) {
      case 2:
        //  处理直播
        window.location.href = '/web/liveRoom.html?roomId=' + id;
        break;
      case 3:
        //  处理回放
        window.location.href = '/web/playback.html?roomId=' + id;
        break;
      default:
        //  默认不处理
    }
  }
});

module.exports = View;
