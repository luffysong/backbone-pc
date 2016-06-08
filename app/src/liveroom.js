/**
 * Created by AaronYuan on 4/22/16.
 */

var $ = require('jquery');

$(function () {
  'use strict';
  var TopBarView = require('TopBarView');
  var MainView = require('./views/live-room/main.view');

  var a = new TopBarView();

  a = new MainView({
    roomType: 'live'
  });

  console.log(a);
  require('../stylesheets/liveroom.scss');
});
