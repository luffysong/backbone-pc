'use strict';
var BaseModel = require('BaseModel');
var Dialog = require('ui.Dialog');
var LoginBox = require('LoginBox');
var cookie = require('cookie');
var Config = require('config');
var domains = Config.domains;
var checkEmailTemplate = require('./template/email.html');
var checkEmailHTML = checkEmailTemplate.replace('{homeSite}', domains.homeSite);
var loginbox = LoginBox().dialog;


var CheckVIPModel = BaseModel.extend({
  url: 'http://vip.yinyuetai.com/vip/check-vip',
  setEnv: true, //自己定义环境变量，不使用config配置文件
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});

var FetchUserInfoForDB = BaseModel.extend({
  url: domains.loginSite + '/login-info',
  setEnv: true, //自己定义环境变量，不使用config配置文件
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});

var UserModel = BaseModel.extend({
  setEnv: true, //自己定义环境变量，不使用config配置文件
  beforeEmit: function (options) {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
    this.checkVIPModel = new CheckVIPModel();
    this.fetchUserInfoForDBModel = new FetchUserInfoForDB();
  },
  /**
   * [isLogined 判断用户是否登录]
   * @return {Boolean} [description]
   */
  isLogined: function () {
    return !!this.getToken(); 
  },
  /**
   * [login 检查是否登录，如果未登录调出对话框]
   * @param  {Function} callback [description]
   * @param  {[type]}   onCancel [description]
   * @return {[type]}            [description]
   */
  login: function (callback, onCancel) {
    var self = this;
    if (this.isLogined()) {
      //已经登录
      callback.call(this);
    } else {
      this.on('login', callback);
      loginbox.trigger('show');
      loginbox.once('hide', function () {
        self.off('login');
        onCancel && onCancel();
      });
    }
  },
  /**
   * [getUserInfo 获取用户信息]
   * @param  {[type]}   key      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  getUserInfo: function (key, callback) {
    if (this.isLogined()) {
      var self = this;
      var value;
      var getParam = function () {
        if (typeof key === 'function') {
          return self.$get();
        } else {
          return self.$get(key);
        }
      };
      var email = this.$get('isEmailVerified');
      if (!callback) {
        callback = key;
      }
      ;
      if (email) {

        if (typeof callback === 'function') {
          value = getParam();
          callback.call(this, value);
        }
      } else {
        this.fetchUserInfo(function () {
          if (typeof callback === 'function') {
            value = getParam();
            callback.call(self, value);
          }
        });
      }
      ;
    }
  },
  /**
   * [checkUserEmail 检查用户是否绑定邮箱]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  checkUserEmail: function (callback) {
    var self = this;
    this.getUserInfo('isEmailVerified', function (isEmailVerified) {
      if (isEmailVerified) {
        if (typeof callback === 'function') {
          callback.call(self);
        }
      } else {
        Dialog.classInstanceDialog(checkEmailHTML, {
          title: '邮箱验证',
          width: 400,
          height: 100,
          isAutoShow: true
        });
      }
      ;
    });
  },
  /**
   * [checkVIPUser 检查是否为VIP用户]
   * @return {[type]} [description]
   */
  checkUserVIP: function (success, error) {
    var self = this;
    if (this.isLogined()) {
      this.login(function () {
        self.fetchVIPInfo(success, error);
      });
    } else {
      var vip = this.$get('vipInfo');
      if (vip) {
        if (vip && !vip.error && vip.realVip && ~~vip.realVip > 0) {
          success(vip);
        } else {
          cancel();
        }
        ;
      } else {
        this.fetchVIPInfo(success, error);
      }
    }
  },
  /**
   * [emit 初始化]
   * @return {[type]} [description]
   */
  emit: function () {
    var token = this.getToken();
    var u_inf = cookie.get('u_inf');
    if (token) {
      if (u_inf && u_inf.length > 0) {
        this.readUserInfoForCookie(u_inf);
      } else {
        this.fetchUserInfo();
      }
    }
  },
  /**
   * [isVIPUser 判断是否是vip用户]
   * @return {Boolean} [description]
   */
  isVIPUser: function () {
    var token = cookie.get('token');
    if (token) {
      var list = token.split(".");
      if (list.length > 2) {
        var val = list[2];
        return ~~val[0] > 0;
      }
      ;
    }
    return false;
  },
  /**
   * [readUserInfoForCookie 从cookie中读取用户信息]
   * @param  {[type]} u_inf [description]
   * @return {[type]}       [description]
   */
  readUserInfoForCookie: function (u_inf) {
    var splitChar = String.fromCharCode(2);
    u_inf = decodeURIComponent(u_inf);
    var users = u_inf.split(splitChar);
    this.$set({
      userId: ~~users[0],
      userName: users[1],
      bigheadImg: users[4]
    });
  },
  /**
   * [fetchUserInfo 获取用户信息]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  fetchUserInfo: function (callback) {
    var self = this;
    this.fetchUserInfoForDBModel.executeJSONP(function (response) {
      self.$set(response);
      if (typeof callback === 'function') {
        callback.call(self);
      }
      ;
    }, function (e) {
      if (typeof callback === 'function') {
        callback.call(self, e);
      }
      ;
    });
  },
  /**
   * [fetchVIPInfo 获取vip信息]
   * @param  {[type]} success [description]
   * @param  {[type]} error   [description]
   * @return {[type]}         [description]
   */
  fetchVIPInfo: function (success, error) {
    var self = this;
    this.checkVIPModel.executeJSONP(function (result) {
      if (result && !result.error) {
        if ((result.realVip && parseInt(result.realVip) > 0) || result.isWo) {
          self.set("vipInfo", result);
          if (typeof success === 'function') {
            success.call(self, result);
          }
        }
      }
    }, function (e) {
      if (typeof error === 'function') {
        error.call(self, e);
      }
    });
  },
  /**
   * [getToken 获取token]
   * @return {[type]} [description]
   */
  getToken: function () {
    return cookie.get('token');
  },
  /**
   * [getUserId 获取userId]
   * @return {[type]} [description]
   */
  getUserId: function () {
    return this.$get('userId');
  }
});
var shared = null;
UserModel.sharedInstanceUserModel = function () {
  if (!shared) {
    shared = new UserModel();
    shared.on('change:userId', function () {
      // shared.trigger('logined');
      shared.trigger('login');
    });
    shared.emit();
  }
  return shared;
};
module.exports = UserModel;
