'use strict';

var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];
var BusinessDate = require('BusinessDate');
var businessDate = new BusinessDate();

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
          businessDate.setCurNewDate(item.liveTime);
          var year = businessDate.$get('year');
          var month = businessDate.$get('month');
          var day = businessDate.$get('day');
          var _hours = businessDate.$get('hours');
          var hours = _hours < 10 ? '0' + _hours : _hours;
          var _minutes = businessDate.$get('minutes');
          var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
          item.liveVideoTime = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
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
