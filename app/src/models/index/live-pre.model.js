'use strict';

var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];
var BusinessDate = require('BusinessDate');

var Model = BaseModel.extend({
  url: '{{url_prefix}}/room/home_hot_list.json',
  beforeEmit: function beforeEmit() {
    // 给请求地址替换一下环境变量
    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
    }
  },
  formatter: function formatter(response) {
    //  formatter方法可以格式化数据
    var code = ~~response.code;
    if (!code) {
      var data = response.data;
      var i = data.length;
      while (i--) {
        var item = data[i];
        if (item.status === 1) {
          item.liveVideoTime = BusinessDate.format(new Date(item.liveTime), 'yyyy-MM-dd hh:mm');
        }
        item.startTimeTxt = BusinessDate.format(new Date(item.startTime), 'yyyy-MM-dd hh:mm');
      }
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
