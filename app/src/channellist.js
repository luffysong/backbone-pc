/**
 * Created by AaronYuan on 5/27/16.
 */

var $ = require('jquery');

$(function () {
  'use strict';
  var TopbarView = require('TopBarView');

  var MainView = require('./views/channel/main.view');

  var a = new TopbarView();
  var b = new MainView();
  console.log(a, b);

  require('../stylesheets/channel-list.scss');
});
