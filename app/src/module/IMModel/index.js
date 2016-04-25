/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var $ = require('jquery');
var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];
var storage = base.storage;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var Model = BaseModel.extend({
  url: '{{url_prefix}}/user/sig_get.json',
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
    // 给请求地址替换一下环境变量
    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
    }
    this.notTokenURL = this.url;
    this.imData = null;
  },
  /**
   * [isAnchor 判断是否为主播]
   * @return {Boolean} [description]
   */
  isAnchor: function () {
    return !!this.get('data.anchor');
  },
  setTokenUrl: function (token) {
    this.imData = {
      deviceinfo: '{"aid":"30001001"}',
      access_token: 'web-' + token
    };
  },
  setNoTokenUrl: function () {
    this.imData = {
      deviceinfo: '{"aid":"30001001"}'
    };
  },
  /**
   * [fetchIMUserSig 获取IM签名]
   * @param  {Function} callback [description]
   * @param  {[type]}   error    [description]
   * @return {[type]}            [description]
   */
  fetchIMUserSig: function () {
    //  先获取本地签名
    var defer = $.Deferred();
    var token;
    var imSig;
    imSig = storage.get('imSig');
    if (imSig) {
      this.set({
        data: imSig
      });
      defer.resolve(imSig);
      return defer.promise();
    }
    token = user.getToken();
    if (token) {
      this.setTokenUrl(token);
    }
    var sigModelPromise = this.executeJSONP(this.imData);
    sigModelPromise.done(function (response) {
      var data = response.data;
      storage.set('imSig', data);
      defer.resolve(data);
    });
    sigModelPromise.fail(function (e) {
      defer.reject(e);
    });
    return defer.promise();
  },
  //  更新缓存
  updateIMUserSig: function () {
    var defer = $.Deferred();
    var token;
    storage.remove('imSig');
    token = user.getToken();
    if (token) {
      this.setTokenUrl(token);
    }
    var sigModelPromise = this.executeJSONP();
    sigModelPromise.done(function (response) {
      var data = response.data;
      storage.set('imSig', data);
      defer.resolve(data);
    });
    sigModelPromise.fail(function (e) {
      defer.reject(e);
    });
    return defer.promise();
  },
  remove: function () {
    storage.remove('imSig');
  }
});

var shared = null;
Model.sharedInstanceIMModel = function () {
  if (!shared) {
    shared = new Model();
  }
  return shared;
};
module.exports = Model;
