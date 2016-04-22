/**
 * @time {时间}
 * @author {编写者}
 * @info 修改房间背景图片
 */

var BaseModel = require('BaseModel');
var Model = BaseModel.extend({
  // 填写请求地址
  url: '{{url_prefix}}/room/bg_set.json?deviceinfo={"aid":"30001001"}' +
  '&access_token=web-{{access_token}}&roomId={{roomId}}&imageUrl={{imageUrl}}',
  beforeEmit: function () {
    // 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
    // this.storageCache = true; //开启本地缓存
    // this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
  }
});
module.exports = Model;
