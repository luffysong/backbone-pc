/**
 * Created by AaronYuan on 4/1/16.
 *
 * 校验模块
 */

'use strict';

var IMModel = require('../IMModel');
var base = require('base-extend-backbone');
var imModel = IMModel.sharedInstanceIMModel();
var store = base.storage;
var msgBox = require('ui.msgBox');

module.exports = {
  onlyAnchorUse: function (url) {
    imModel.fetchIMUserSig(function (sig) {
      if (!sig.anchor) {
        window.location.href = url || '/index.html';
      }
    }, function () {
      window.location.href = '/index.html';
    });
  },
  forbidVisitorBehavior: function (user, msg) {
    var flag = true;
    switch (msg) {
      case 1:
        msg = '登录后，可关注主播哟!';
        break;
      case 2:
        msg = '登录后，可支持主播哟!';
        break;
      case 3:
        msg = '登录后，可向主播送礼哟!';
        break;
      case 4:
        msg = '登录后，可对主播点赞哟!';
        break;
      default:
        msg = '登录后，可发送消息哟!';
        break;
    }
    if (!user.isLogined()) {
      store.remove('imSig');
      store.set('signout', 1);
      if (!msg) {
        msg = '登录后，可发送消息哟!';
      }
      msgBox.showTip(msg);
      flag = false;
    }
    return flag;
  }
};
