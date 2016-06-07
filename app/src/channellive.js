/**
 *
 * Created by AaronYuan on 6/7/16.
 */
// 频道直播页面
var $ = require('jquery');

$(function () {
  'use strict';
  var TopBarView = require('TopBarView');
  var MainView = require('./views/live-room/main.view');

  var a = new TopBarView();

  a = new MainView();

  console.log(a);
  require('../stylesheets/liveroom.scss');
});
