/**
 * Created by AaronYuan on 4/21/16.
 * 场控页面
 */

var $ = require('jquery');
$(function () {
  var MainView = require('./views/anchor/main.view');
  var TopBarView = require('TopBarView');

  var a = new MainView({
    assistant: true
  });
  a = new TopBarView();
  console.log(a);
  // 载入CSS
  require('../stylesheets/anchor.scss');
});
