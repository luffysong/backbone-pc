/**
 * Created by YYT on 2016/4/20.
 */
var base = require('base-extend-backbone');
var Auxiliary = require('auxiliary-additions');
var _ = require('underscore');
var BaseModel = base.Model;
var Dialog = require('ui.Dialog');
var loginBox = require('loginBox');
var cookie = Auxiliary.cookie;
var Config = require('config');
var domains = Config.domains;
var checkEmailTemplate = require('./template/email.html');
var checkEmailHTML = checkEmailTemplate.replace('{homeSite}', domains.homeSite);
var loginbox = loginBox().dialog;

var CheckVIPModel = BaseModel.extend({
  url: 'http://vip.yinyuetai.com/vip/check-vip',
  setEnv: true,
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});

var FetchUserInfoForDB = BaseModel.extend({
  url: domains.loginSite + '/login-info',
  setEnv: true,
  beforeEmit: function () {
    //  如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    //  this.storageCache = true; //开启本地缓存
    //  this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});

var UserModel = BaseModel.extend({
  setEnv: true,
  beforeEmit: function () {
    //  如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    //  this.storageCache = true; //开启本地缓存
    //  this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
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
  login: function () {
    var defer = $.Deferred();
    if (this.isLogined()) {
      //  已经登录
      defer.resolve();
    } else {
      loginbox.trigger('show');
      loginbox.once('hide', function () {
        defer.resolve();
      });
    }
    return defer.promise();
  },
  /**
   * [getUserInfo 获取用户信息]
   * @param  {[type]}   key      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  getUserInfo: function (key, callback) {
    var value;
    var email;
    var self = this;
    var _key = key;
    var _callback = callback;
    var getParam = function () {
      if (_.isFunction(_key)) {
        return self.get();
      }
      return self.get(_key);
    };
    if (this.isLogined()) {
      email = this.get('isEmailVerified');
      if (!_callback) {
        _callback = _key;
      }
      if (email) {
        if (_.isFunction(_callback)) {
          value = getParam();
          _callback.call(this, value);
        }
      } else {
        this.fetchUserInfo(function () {
          if (_.isFunction(_callback)) {
            value = getParam();
            _callback.call(self, value);
          }
        });
      }
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
    });
  },
  /**
   * [checkVIPUser 检查是否为VIP用户]
   * @return {[type]} [description]
   */
  checkUserVIP: function (success, error) {
    var vip;
    var self = this;
    if (this.isLogined()) {
      this.login(function () {
        self.fetchVIPInfo(success, error);
      });
    } else {
      vip = this.get('vipInfo');
      if (vip) {
        if (vip && !vip.error && vip.realVip && ~~vip.realVip > 0) {
          success(vip);
        }
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
    var uinf = cookie.get('u_inf');
    if (token) {
      if (uinf && uinf.length > 0) {
        this.readUserInfoForCookie(uinf);
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
    var list;
    var token;
    var val;
    token = cookie.get('token');
    if (token) {
      list = token.split('.');
      if (list.length > 2) {
        val = list[2];
        return ~~val[0] > 0;
      }
    }
    return false;
  },
  /**
   * [readUserInfoForCookie 从cookie中读取用户信息]
   * @param  {[type]} u_inf [description]
   * @return {[type]}       [description]
   */
  readUserInfoForCookie: function (uinfs) {
    var uinf;
    var users;
    var splitChar;
    splitChar = String.fromCharCode(2);
    uinf = decodeURIComponent(uinfs);
    users = uinf.split(splitChar);
    this.set({
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
    var promise = this.fetchUserInfoForDBModel.executeJSONP();
    promise.done(function (response) {
      self.set(response);
      if (_.isFunction(callback)) {
        callback.call(self);
      }
    });
    promise.fail(function () {
      if (_.isFunction(callback)) {
        callback.call(self.e);
      }
    });
  },
  /**
   * [fetchVIPInfo 获取vip信息]
   * @return {[type]}         [description]
   */
  fetchVIPInfo: function () {
    var self = this;
    var defer = $.Deferred();
    var promise = this.checkVIPModel.executeJSONP();
    promise.done(function (result) {
      if (result && !result.error) {
        if ((result.realVip && parseInt(result.realVip, 10) > 0) || result.isWo) {
          self.set('vipInfo', result);
          defer.resolve.call(self, result);
        }
      }
    });
    promise.fail(function (e) {
      defer.reject.call(self, e);
    });
    return defer.promise();
  },
  /**
   * [getToken 获取token]
   * @return {[type]} [description]
   */
  getToken: function () {
    return cookie.get('token');
  },
  getWebToken: function () {
    var token = cookie.get('token');
    return token ? ('web-' + token) : '';
  },
  /**
   * [getUserId 获取userId]
   * @return {[type]} [description]
   */
  getUserId: function () {
    return this.get('userId');
  }
});

var shared = null;
var reloadChose = false;
if (cookie.get('token')) {
  reloadChose = true;
}
UserModel.sharedInstanceUserModel = function () {
  if (!shared) {
    shared = new UserModel();
    shared.on('change:userId', function () {
      if (!reloadChose) {
        window.location.reload();
      }
      shared.trigger('login');
      shared.trigger('logined');
    });
    shared.emit();
  }
  return shared;
};

UserModel.get = function (name) {
  if (shared) {
    return shared.get(name);
  }
  return null;
};

module.exports = UserModel;
