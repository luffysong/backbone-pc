/**
 * Created by AaronYuan on 4/5/16.
 * 用户
 */
'use strict';

var AnchorUserInfoModel = require('../../models/anchor/anchor-info.model');
var base = require('base-extend-backbone');
var Storage = base.storage;
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var instance = null;
var _ = require('underscore');

function UserInfoView() {
}

UserInfoView.prototype.getInfo = function (okFn, errFn) {
  var promise;
  this.anchorInfoModel = AnchorUserInfoModel.sharedInstanceModel();
  this.anchorInfoParams = {
    deviceinfo: '{"aid": "30001001"}',
    access_token: user.getWebToken()
  };
  promise = this.anchorInfoModel.executeJSONP(this.anchorInfoParams);
  promise.done(function (res) {
    if (res && res.msg === 'SUCCESS') {
      if (okFn) {
        okFn(res.data);
      }
    }
  });
  promise.fail(function (err) {
    if (errFn) {
      errFn(err);
    }
  });
};

instance = new UserInfoView();

module.exports = {
  getInfo: function (okFn, errFn) {
    instance.getInfo(okFn, errFn);
  },
  isDisbaleTalk: function (userId, roomId) {
    var list = Storage.get('userDisableTalkTime');
    if (!list) {
      return false;
    }
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [];
    }
    var res = _.find(list, function (item) {
      return item.roomId === roomId && item.userId === userId;
    });
    if (!res) {
      return false;
    }

    var time = res.time;
    if (!time) {
      return false;
    }

    time = new Date(time);
    var cur = new Date();
    var diff = cur.getTime() - time.getTime();

    return diff <= 0;
  },
  isKickout: function (roomId) {
    var list = Storage.get('userKickout');
    if (!list) {
      return false;
    }
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [];
    }
    var res = _.find(list, function (item) {
      return item.roomId === roomId;
    });
    return !!res && res.isKickout;
  },
  setDisableTalk: function (userid, roomid, time) {
    var list = Storage.get('userDisableTalkTime');
    if (_.isNumber(list)) {
      list = [];
    }
    if (!list) {
      list = [];
    }
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [];
    }
    var res = _.find(list, function (item) {
      return item.roomId === roomid && item.userId === userid;
    });

    if (res) {
      res.time = time;
    } else {
      list.push({
        roomId: roomid,
        userId: userid,
        time: time
      });
    }
    Storage.set('userDisableTalkTime', JSON.stringify(list));
  },
  setKickout: function (roomId, isKickout) {
    var list = Storage.get('userKickout');
    if (!list) {
      list = [];
    } else {
      try {
        list = JSON.parse(list);
      } catch (e) {
        list = [];
      }
    }
    var res = _.find(list, function (item) {
      return item.roomId === roomId;
    });
    if (res) {
      res.isKickout = isKickout;
    } else {
      list.push({
        roomId: roomId,
        isKickout: isKickout
      });
    }
    Storage.set('userKickout', JSON.stringify(list));
  },
  setLockScreen: function (roomId, isLock) {
    var list = Storage.get('isLockScreen');
    if (!list) {
      list = [];
    } else {
      list = JSON.parse(list);
    }
    var res = _.find(list, function (item) {
      return item.roomId === roomId;
    });
    if (res) {
      res.isLock = isLock;
    } else {
      list.push({
        roomId: roomId,
        isLock: isLock
      });
    }
    Storage.set('isLockScreen', JSON.stringify(list));
  },
  isLockScreen: function (roomId) {
    var list = Storage.get('isLockScreen');
    if (!list) {
      return false;
    }
    list = JSON.parse(list);
    var res = _.find(list, function (item) {
      return item.roomId === roomId;
    });
    return !!res && res.isLock;
  },
  removeAll: function () {
    Storage.set('isLockScreen', '');
    Storage.set('userDisableTalkTime', '');
    Storage.set('userKickout', '');
  }
};
