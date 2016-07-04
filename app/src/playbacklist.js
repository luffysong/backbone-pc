/**
 *
 * Created by AaronYuan on 5/4/16.
 */

var $ = require('jquery');

$(function () {
  'use strict';
  var TopBarView = require('TopBarView');
  var a = new TopBarView();
  var MainView = require('./views/playback/list.view');
  var b = new MainView();

  console.log(a, b);

  require('../stylesheets/playbacklist.scss');
});
