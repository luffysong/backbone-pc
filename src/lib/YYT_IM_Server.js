/**
 * 主播控制
 */

'use strict';
var IMModel = require('./IMModel');
var imModel = IMModel.sharedInstanceIMModel();
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
    var self = this;
    imModel.fetchIMUserSig(function (imSig) {
        self.im = imSig;
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
    }, function (err) {
        console.log(err);
    });
};

/**
 * 发送消息
 *
 */
YYTIMServer.sendMessage = function (attrs, okFn, errFn) {
    //var currentSession = webim.MsgStore.sessByTypeId('GROUP', attrs.groupId);
    var random = Math.floor(Math.random() * 10000);
    var currentSession = new webim.Session('GROUP', attrs.groupId, attrs.groupId, '', random);

    if (currentSession) {
        var sendMsg = new webim.Msg(currentSession, true);
        sendMsg.addText(new webim.Msg.Elem.Text(JSON.stringify(attrs.msg)));
        sendMsg.fromAccount = this.im.imIdentifier;
        webim.sendMsg(sendMsg, function (resp) {
            okFn && okFn(resp);
        }, function (err) {
            errFn && errFn(err);
        });
    }
};


/**
 * 清屏
 */
YYTIMServer.clearScreen = function (args) {
    this.sendMessage(args);
};

/**
 * 锁屏
 */
YYTIMServer.lockScreen = function () {
    console.log('IM lock');
};

/**
 * 禁言
 //options = {
    //    'GroupId': '',
    //    'Members_Account': [],
    //    'ShutUpTime': time
    //};
 */
YYTIMServer.disableSendMsg = function (options, okFn, errFn) {
    var time = webim.Tool.formatTimeStamp(Math.round(new Date().getTime() / 1000) + 10 * 60);

    time = new Date(time + '').getTime();
    options = _.extend({
        'ShutUpTime': time
    }, options);
    webim.forbidSendMsg(
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
            errFn && errFn(err);
        }
    );
};

YYTIMServer.applyJoinGroup = function (groupId, okFn, errFn) {
    var options = {
        'GroupId': groupId,
        'ApplyMsg': '直播间',
        'UserDefinedField': ''
    };
    webim.applyJoinGroup(
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
            errFn && errFn(err);
        }
    );
};

/**
 * 修改群组消息
 * @param options
 *      { GroupId: 1, Name: 'xx', Notification: '', Introduction: ''}
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


module.exports = YYTIMServer;