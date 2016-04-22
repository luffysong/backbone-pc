/**
 * Created by AaronYuan on 4/1/16.
 *
 * 校验模块
 */

'use strict';

var IMModel = require('../IMModel');
var imModel = IMModel.sharedInstanceIMModel();

module.exports = {
  onlyAnchorUse: function (url) {
    imModel.fetchIMUserSig(function (sig) {
      if (!sig.anchor) {
        window.location.href = url || '/index.html';
      }
    }, function () {
      window.location.href = '/index.html';
    });
  }
};

