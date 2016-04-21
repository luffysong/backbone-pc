/**
 * Created by AaronYuan on 4/21/16.
 */
var $ = require('jquery');

$(function () {
  var MainView = require('./view/anchor/main.view');
  var TopbarView = require('./view/topbar/topbar.view');

  var a = new MainView();

  a = new TopbarView();
  console.log(a);

  // 载入CSS
  require('../style/less/anchor.less');
});
