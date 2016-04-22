var $ = require('jquery');
$(function () {
  var base = require('base-extend-backbone');
  var storage = base.storage;
  var location = window.location;
  var signout = storage.get('signout');
  var config = require('config');
  if (signout) {
    storage.remove('signout');
    location.href = 'http://login.yinyuetai.com/logout';
    return;
  }
  var UserModel = require('UserModel');
  var TopBarView = require('TopBarView');
  var IMModel = require('IMModel');
  var topbarView = new TopBarView();
  var imModel = IMModel.sharedInstanceIMModel();
  var user = UserModel.sharedInstanceUserModel();
  var msgBox = require('ui.msgBox');
  var fetchIMUserSig = function () {
    var promise = imModel.fetchIMUserSig();
    promise.done(function (sig) {
      if (!sig.anchor) {
        //  storage.remove('imSig');
        //  msgBox.showError('获取签名错误，原因：你可能不是主播；');
        window.location.href = config.prefix + '/index.html';
      } else {
        //  处理登录成功跳转到设置页面
        window.location.href = config.prefix + '/anchorsetting.html';
      }
    });
    promise.fail(function () {
      storage.remove('imSig');
      //  处理请求错误
      msgBox.showError('获取签名错误，原因：网络或服务器错误');
    });
  };
  if (!user.isLogined()) {
    //  如果未登录状态，清除签名
    storage.remove('imSig');
    topbarView.on('logined', function () {
      fetchIMUserSig();
    });
    topbarView.showLoginDialog();
  } else {
    fetchIMUserSig();
  }
  require('../stylesheets/login.scss');
});
