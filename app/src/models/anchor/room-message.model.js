/**
 * @time {时间}
 * @author YuanXuJia
 * @info 获取房间消息
 */

'use strict';

var BaseModel = require('BaseModel');
var Model = BaseModel.extend({
  url: '{{url_prefix}}/message/get.json?deviceinfo={{deviceinfo}}&' +
  'access_token=web-{{accessToken}}&roomId={{roomId}}&startTime={{startTime}}&' +
  'endTime={{endTime}}&cursor={{cursor}}&limit={{limit}}', // 填写请求地址
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});
module.exports = Model;
