/**
 * 主播控制
 */

'use strict';
var IMModel = require('./IMModel');
var store = require('store');

var YYTIMServer = {
    setting: {
        listeners: {
            onMsgNotify: null,
            onGroupInfoChangeNotify: null,
            groupSystemNotifys: null
        }
    }
};

/**
 * 初始化
 * @param options
 */
YYTIMServer.init = function (options) {
    var imSig = store.get('imSig');
    var loginInfo = {
        sdkAppID: imSig.imAppid, //用户所属应用id
        appIDAt3rd: imSig.imAppid, //用户所属应用id
        accountType: imSig.imAccountType, //用户所属应用帐号类型
        identifier: imSig.imIdentifier, //当前用户ID
        userSig: imSig.userSig //当前用户身份凭证
    };
    if (imSig && options) {
        //腾讯IM初始化
        webim.init(loginInfo, options, null);
    }
};

/**
 * 清屏
 */
YYTIMServer.clearScreen = function () {
    console.log('IM clear');
};

/**
 * 锁屏
 */
YYTIMServer.lockScreen = function () {
    console.log('IM lock');
};

/**
 * 禁言
 */
YYTIMServer.disableSendMsg = function () {
    console.log('禁言中.....');
};

/**
 * 踢人
 * options : {GroupId: '', MemberToDel_Account: []}
 */
YYTIMServer.removeUserFromGroup = function (options, okFn, errFn) {
    if (!options || !options.GroupId || options.MemberToDel_Account.length <= 0) {
        errFn && errFn({
            msg: '参数不正确'
        });
    }
    webim.deleteGroupMember(
        options,
        function (resp) {
            okFn && okFn(resp);
        },
        function (err) {
            errFn && errFn(err);
        }
    );
};

/**
 * 消息通知回调
 */
YYTIMServer.msgNotify = function (callback) {

};

/**
 * 获取群组消息
 */
YYTIMServer.getRoomMsgs = function (callback) {
    var data = [];
    var i = 1;
    while (true) {
        if (i++ > 20) {
            break;
        }
        data.push({
            name: 'Aaron-' + i,
            msg: 'asdfasdfasfjaslfjasklfasdklf' + i
        });
    }
    callback && callback.call(this, data);
};

/**
 * 创建聊天群
 */
YYTIMServer.createIMChatRoom = function (okFn, errFn) {
    var imSig = store.get('imSig');
    var options = {
        'Owner_Account': imSig.imIdentifier,
        'Type': 'ChatRoom', //Private/Public/ChatRoom
        'Name': '测试聊天室',
        //'FaceUrl': '',
        'Notification': '',
        'Introduction': '',
        'MemberList': []
    };

    webim.createGroup(
        options,
        function (resp) {
            okFn && okFn(resp);
        },
        function (err) {
            console.log(err.ErrorInfo);
            errFn && errFn(err);
        }
    );
};

/**
 * 获取群组消息
 * @param groupId
 * @param okFn
 * @param errFn
 */
YYTIMServer.getGroupInfo = function (groupId, okFn, errFn) {
    var options = {
        'GroupIdList': [
            groupId
        ],
        'GroupBaseInfoFilter': [
            'Type',
            'Name',
            'Introduction',
            'Notification',
            'FaceUrl',
            'CreateTime',
            'Owner_Account',
            'LastInfoTime',
            'LastMsgTime',
            'NextMsgSeq',
            'MemberNum',
            'MaxMemberNum',
            'ApplyJoinOption'
        ],
        'MemberInfoFilter': [
            'Account',
            'Role',
            'JoinTime',
            'LastSendMsgTime',
            'ShutUpUntil'
        ]
    };
    webim.getGroupInfo(
        options,
        function (resp) {
            okFn && okFn(resp);
        },
        function (err) {
            alert(err.ErrorInfo);
            errFn && errFn(err);
        }
    );
};

/**
 * 修改群组消息
 * @param options {GroupId: xx, Name: 'xx', Notification: '', Introduction: ''}
 * @param okFn
 * @param errFn
 */
YYTIMServer.modifyGroupInfo = function (options, okFn, errFn) {
    webim.modifyGroupBaseInfo(
        options,
        function (resp) {
            okFn && okFn(resp);
        },
        function (err) {
            errFn && errFn(err);
        }
    );
};


/**
 * 腾讯IM收到消息通知的回调函数
 * @param notifyInfo
 */
function onMsgNotify(notifyInfo) {

    YYTIMServer.setting.listeners.onMsgNotify && YYTIMServer.setting.listeners.onMsgNotify(notifyInfo);

}


/**
 * 腾讯监听群组资料变更的回调函数
 * @param notifyInfo
 */
function onGroupInfoChangeNotify(notifyInfo) {

    YYTIMServer.setting.listeners.onGroupInfoChangeNotify && YYTIMServer.setting.listeners.onGroupInfoChangeNotify(notifyInfo);
}

/**
 * 用于监听（多终端同步）群系统消息的回调函数
 * @param notifyInfo
 */
function groupSystemNotifys(notifyInfo) {
    YYTIMServer.setting.listeners.groupSystemNotifys && YYTIMServer.setting.listeners.groupSystemNotifys(notifyInfo);
}


module.exports = YYTIMServer;