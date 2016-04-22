/**
 * @time 2016-3-11
 * @author YuanXujia
 * @info 获取房间详情
 */

'use strict';

var BaseModel = require('BaseModel');
var sigleInstance = null;

var Model = BaseModel.extend({
  url: '{{url_prefix}}/room/detail.json?deviceinfo={{deviceinfo}}&' +
  'access_token=web-{{accessToken}}&roomId={{roomId}}', // accessToken 填写请求地址
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});

/**
 * 获取单例对象
 */
Model.sigleInstance = function () {
  if (!sigleInstance) {
    sigleInstance = new Model();
  }
  return sigleInstance;
};

module.exports = Model;
