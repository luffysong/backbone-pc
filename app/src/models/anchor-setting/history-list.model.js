'use strict';

var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];
var BusinessDate = require('BusinessDate');
var businessDate = new BusinessDate();
/*
  deviceinfo={{deviceinfo}}
  access_token=web-{{access_token}}
  order={{order}}
  offset={{offset}}
  size={{size}}
 */
var Model = BaseModel.extend({
  url: '{{url_prefix}}/room/end_list.json',
  beforeEmit: function beforeEmit() {
    // 给请求地址替换一下环境变量
    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
      this.url = this.url.replace('{{url_prefix}}', env.url_prefix);
    }
  },
  formatter: function (response) {
    //  formatter方法可以格式化数据
    var code = ~~response.code;
    if (code) {
      return response;
    }
    var data = response.data;
    var roomList = data.roomList;
    var l = roomList.length;
    while (l--) {
      var value = roomList[l];
      var d = BusinessDate.difference(value.duration > 0 ? value.duration : 0);
      value.diff = d.hours + ':' + d.minutes + ':' + d.seconds;
      var liveTime = value.liveTime;
      businessDate.setCurNewDate(liveTime);
      var year = businessDate.$get('year');
      var month = businessDate.$get('month');
      var day = businessDate.$get('day');
      var _hours = businessDate.$get('hours');
      var hours = _hours < 10 ? '0' + _hours : _hours;
      var _minutes = businessDate.$get('minutes');
      var minutes = _minutes < 10 ? '0' + _minutes : _minutes;
      value.liveVideoTime = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
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
