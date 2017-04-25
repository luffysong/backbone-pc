/**
 * Created by AaronYuan on 4/25/16.
 */

var $ = require('jquery');

$(function () {
  'use strict';
  var TopbarView = require('TopBarView');

  var MainView = require('./views/playback/main.view');

  var a = new TopbarView();
  a = new MainView();
  console.log(a);

  require('../stylesheets/liveroom.scss');
});
