/**
 * Created by AaronYuan on 4/21/16.
 */

var $ = require('jQuery');
$(function () {
  var MainView = require('./views/anchor/main.view');
  var TopbarView = require('TopbarView');

  var a = new MainView();
  a = new TopbarView();
  console.log(a);
  // 载入CSS
  require('../stylesheets/anchor.scss');
});
