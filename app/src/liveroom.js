/**
 * Created by AaronYuan on 4/22/16.
 */

var $ = require('jquery');

$(function () {
  'use strict';
  var TopBarView = require('TopBarView');
  var a = new TopBarView();
  console.log(a);

  // var MainView = require('./view/live-room/main.view');
  // new MainView();

  require('../stylesheets/liveroom.scss');
});
