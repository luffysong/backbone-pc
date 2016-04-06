/**
 * Created by AaronYuan on 4/5/16.
 * 用户
 */
var AnchorUserInfoModel = require('../../model/anchor/anchor-info.model');
var Storage = require('store');
var DateTimeHelper = require('DateTime');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

'use strict';

var instance = null, cacheData;

function UserInfoView() {

}

UserInfoView.prototype.getInfo = function (okFn, errFn) {
    this.anchorInfoModel = AnchorUserInfoModel.sigleInstance();
    this.anchorInfoParams = {
        deviceinfo: '{"aid": "30001001"}',
        access_token: 'web-' + user.getToken()
    };
    this.anchorInfoModel.executeJSONP(this.anchorInfoParams, function (res) {
        if (res && res.msg === 'SUCCESS') {
            okFn && okFn(res.data);
            cacheData = res.data;
        }
    }, function (err) {
        errFn && errFn(err);
    });
};

instance = new UserInfoView();

module.exports = {
    getInfo: function (okFn, errFn) {
        if (cacheData) {
            okFn && okFn(cacheData);
            return;
        }
        instance.getInfo(okFn, errFn);
    },
    isDisbaleTalk: function () {
        var time = Storage.get('userDisableTalkTime');
        if (!time) {
            return false;
        }
        time = new Date(time);
        var cur = new Date();
        var diff = cur.getTime() - time.getTime();
        //var result = DateTimeHelper.difference(Math.abs(diff));

        return diff <= 0;
    },
    isKickout: function (roomId) {
        var list = Storage.get('userKickout');
        if (!list) {
            return false;
        } else {
            list = JSON.parse(list);
        }
        var res = _.find(list, function (item) {
            return item.roomId == roomId;
        });
        return !!res && res.isKickout;
    },
    setDisableTalk: function (time) {
        if (time) {
            Storage.set('userDisableTalkTime', time);
        }
    },
    setKickout: function (roomId, isKickout) {
        var list = Storage.get('userKickout');
        if (!list) {
            list = []
        } else {
            list = JSON.parse(list);
        }
        var res = _.find(list, function (item) {
            return item.roomId == roomId;
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
            list = []
        } else {
            list = JSON.parse(list);
        }
        var res = _.find(list, function (item) {
            return item.roomId == roomId;
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
        } else {
            list = JSON.parse(list);
        }
        var res = _.find(list, function (item) {
            return item.roomId == roomId;
        });
        return !!res && res.isLock;
    }

};
