'use strict';

var base = require('base-extend-backbone');
var Config = require('config');
var BaseModel = base.Model;
var env = Config.env[Config.scheme];
var BusinessDate = require('BusinessDate');
var businessDate = new BusinessDate();
var url = '{{url_prefix}}/room/no_open_list.json';
var Model = BaseModel.extend({
  url: url,
  beforeEmit: function beforeEmit() {
    // 给请求地址替换一下环境变量
    if (/^\{{0,2}(url_prefix)\}{0,2}/.test(this.url)) {
      this.url = this.url.replace('{{url_prefix}}', env.url_prefix).split('?')[0];
    }
  },
  formatter: function (response) {
    var code = ~~response.code;
    if (code) {
      return response;
    }
    var data = response.data;
    var roomList = data.roomList;
    var l = 	roomList.length;
    while (l--) {
      var value = roomList[l];
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
      value.lookUrl = '/web/anchor.html?roomId=' + value.id;
      value.liCacheKey = value.id + '-' + value.streamName;
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
