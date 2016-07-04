/**
 * 获取频道下正在直播的节目单接口
 */
'use strict';

var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];
var BusinessDate = require('BusinessDate');

var Model = BaseModel.extend({
  url: '{{url_prefix}}/channel/show/live_get.json',
  beforeEmit: function beforeEmit() {
    // 给请求地址替换一下环境变量
    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
    }
  },
  formatter: function (response) {
    if (~~response.code) {
      return null;
    }
    var videos = response.data.videos || [];
    var len = videos.length;
    while (len--) {
      var item = videos[len];
      item.playTime = BusinessDate.format(new Date(item.liveTime), 'hh:mm');
    }
    return response;
  }
});

var shared = null;
Model.sharedInstanceModel = function sharedInstanceModel() {
  if (!shared) {
    shared = new Model();
  }
  return shared;
};

module.exports = Model;
