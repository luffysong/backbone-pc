/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';
var base = require('base-extend-backbone');
var BaseModel = base.Model;
var storage = base.storage;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var Model = BaseModel.extend({
  url: '{{url_prefix}}/user/sig_get.json',
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
    this.notTokenURL = this.url;
    this.imData = null;
  },
  /**
   * [isAnchor 判断是否为主播]
   * @return {Boolean} [description]
   */
  isAnchor: function () {
    //  deviceinfo={"aid":"30001001"}
    return !!this.$get('data.anchor');
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
  fetchIMUserSig: function (callback, error) {
      //  先获取本地签名
    var token;
    var imSig;
    imSig = storage.get('imSig');
    if (imSig) {
      if (typeof callback === 'function') {
        this.$set({ data: imSig });
        callback(imSig);
      }
      return;
    }
    token = user.getToken();
    if (token) {
      this.setTokenUrl(token);
    }
    this.executeJSONP(this.imData, function (response) {
      var data = response.data;
      storage.set('imSig', data);
      if (typeof callback === 'function') {
        callback(data);
      }
    }, function (e) {
      if (typeof error === 'function') {
        error(e);
      }
    });
  },
  //  更新缓存
  updateIMUserSig: function (okFn, errFn) {
    var token;
    storage.remove('imSig');
    token = user.getToken();
    if (token) {
      this.setTokenUrl(token);
    }
    this.executeJSONP(function (response) {
      var data = response.data;
      storage.set('imSig', data);
      if (okFn) {
        okFn(data);
      }
    }, function (err) {
      if (errFn) {
        errFn(err);
      }
    });
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
