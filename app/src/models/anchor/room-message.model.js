'use strict';

var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];

var Model = BaseModel.extend({
  url: '{{url_prefix}}/message/get.json?deviceinfo={{deviceinfo}}&' +
  'access_token=web-{{accessToken}}&roomId={{roomId}}&startTime={{startTime}}&' +
  'endTime={{endTime}}&cursor={{cursor}}&limit={{limit}}', // 填写请求地址
  beforeEmit: function beforeEmit() {
    // 给请求地址替换一下环境变量
    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
    }
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
