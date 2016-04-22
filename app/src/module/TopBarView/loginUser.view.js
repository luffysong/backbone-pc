'use strict';

var Backbone = require('backbone');
var base = require('base-extend-backbone');
var BaseView = base.View;
var storage = base.storage;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var loginBox = require('loginBox');
var sginHTML = require('./template/sgin.html');
var loginedTemp = require('./template/logined.html');
var win = window;
var location = win.location;
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var config = require('config');
var View = BaseView.extend({
  el: '#loginUser',
  events: {
    'click #login': 'loginHandler',
    'click .show-drop-menu': 'showDropMenu',
    'click #logout': 'logoutHandler',
    'mouseover .hoverMenu': 'nameHover',
    'mouseout .hoverMenu': 'nameOut'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this._dialog = null;
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.loginBox = loginBox();
    this._dialog = this.loginBox.dialog;
    this.userDromMenu = this.findDOMNode('.pcNav');
  },
  ready: function () {
    //  初始化
    if (user.isLogined()) {
      //  已经登录
      this.fetchUserInfo();
    } else {
      //  未登录
      this.$el.html(sginHTML);
    }
    this.hideDropMenu();
    this.defineEventInterface();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  /**
   * [loginHandler 处理登录按钮]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  loginHandler: function (e) {
    var _this = this;
    var status = this._dialog.status();
    e.preventDefault();
    if (status === 'hide') {
      this._dialog.trigger('show');
      this._dialog.once('hide', function () {
        if (user.isLogined()) {
          storage.remove('imSig');
          _this.fetchUserInfo();
          _this.trigger('topbar-logined');
        }
      });
    } else {
      this._dialog.trigger('hide');
    }
  },
  /**
   * [logoutHandler 退出]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  logoutHandler: function () {
    storage.remove('imSig');
    storage.set('signout', 1);
    location.href = config.prefix + '/login.html';
  },
  fetchUserInfo: function () {
    var _this = this;
    var fetchImUserSigPromise = imModel.fetchIMUserSig();
    fetchImUserSigPromise.done(function (userImInfo) {
      var data;
      if (userImInfo.roleType === 2) {
        //  游客，未登录
        _this.$el.html(sginHTML);
      } else {
        data = {
          userName: userImInfo.nickName,
          bigheadImg: userImInfo.largeAvatar
        };
        _this.render(data);
      }
    });
  },
  render: function (data) {
    var loginedHTML = this.compileHTML(loginedTemp, data);
    this.$el.html(loginedHTML);
    this.showDropMenuEle = $('.loginMsg .pcNav');
  },
  /**
   * 显示下拉菜单
   */
  showDropMenu: function (e) {
    e.preventDefault();
    this.showDropMenuEle.toggle();
    return false;
  },
  /**
   * 隐藏下拉菜单
   */
  hideDropMenu: function () {
    var _this = this;
    $(document).on('click', function () {
      if (_this.showDropMenuEle) {
        _this.showDropMenuEle.hide();
      }
    });
  },
  showDialog: function () {
    var _this = this;
    this._dialog.trigger('show');
    this._dialog.once('hide', function () {
      if (user.isLogined()) {
        _this.trigger('topbar-logined');
      }
    });
  },
  hideDialog: function () {
    this._dialog.trigger('hide');
  },
  /**
   * 定义对外公布的事件
   */
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:userProfileChanged', function (users) {
      var data = {
        userName: users.nickName,
        bigheadImg: users.headImg
      };
      self.render(data);
    });
  },
  nameHover: function () {
    this.showDropMenuEle.show();
  },
  nameOut: function () {
    this.showDropMenuEle.hide();
  }
});

module.exports = View;
