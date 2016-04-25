var $ = require('jquery');
$(function () {
  var MainView = require('./views/anchor-setting/main.view');
  var mainView = new MainView();
  console.log(mainView);
  require('../stylesheets/anchor-setting.scss');
});
