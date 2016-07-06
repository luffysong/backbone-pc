/**
 * 主播控制
 */

'use strict';
var base = require('base-extend-backbone');
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var store = base.storage;
var webim = window.webim;
var _ = require('underscore');
var $ = require('jquery');

var imServer = {
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
imServer.init = function (listeners) {
  var self = this;
  var defer = $.Deferred();
  var promise = imModel.fetchIMUserSig();
  promise.then(function (imSig) {
    var loginInfo = {
      sdkAppID: imSig.imAppid, // 用户所属应用id
      appIDAt3rd: imSig.imAppid, // 用户所属应用id
      accountType: imSig.imAccountType, // 用户所属应用帐号类型
      identifier: imSig.imIdentifier, // 当前用户ID
      userSig: imSig.userSig // 当前用户身份凭证
    };
    self.im = imSig;
    if (imSig && listeners) {
      // 腾讯IM初始化
      // webim.init(loginInfo, listeners, null);
      webim.login(loginInfo, listeners, null, function () {
        defer.resolve();
      }, function (err) {
        console.log(err);
        defer.reject();
      });
    } else {
      defer.reject();
    }
  }, function (err) {
    console.log(err);
    defer.reject();
  });
  return defer.promise();
};

/**
 * 发送消息
 *
 */
imServer.sendMessage = function (attrs, okFn, errFn) {
  var currentSession = webim.MsgStore.sessByTypeId('GROUP', attrs.groupId);
  var random = Math.floor(Math.random() * 10000);
  var sendMsg;
  var msg;
  if (!currentSession) {
    // var currentSession = new webim.Session('GROUP', attrs.groupId, attrs.groupId, '', random);
    currentSession = new webim.Session('GROUP', attrs.groupId, attrs.groupId, '', random);
  }

  if (currentSession) {
    sendMsg = new webim.Msg(currentSession, true);
    msg = new webim.Msg.Elem('TIMCustomElem', {
      data: JSON.stringify(attrs.msg)
    });
    sendMsg.elems.push(msg);
    sendMsg.fromAccount = this.im.imIdentifier;
    webim.sendMsg(sendMsg, function (resp) {
      if (okFn) {
        okFn(resp);
      }
    }, function (err) {
      if (errFn) {
        errFn(err);
      }
    });
  }
};

/**
 * 1.4 版本发送消息
 *  attrs.subType
 *  attrs.msg.fromAccount
 */
imServer.sendMsg = function (attrs) {
  console.log(attrs);
  var defer = $.Deferred();
  var currentSession = webim.MsgStore.sessByTypeId('GROUP', attrs.groupId);
  var random = Math.round(Math.random() * 4294967296); // 消息随机数，用于去重

  if (!currentSession) {
    currentSession = new webim.Session(
      webim.SESSION_TYPE.GROUP, attrs.groupId, attrs.groupId, '', random);
  }
  var seq = -1; // 消息序列，-1表示sdk自动生成，用于去重
  var msgTime = Math.round(new Date().getTime() / 1000); // 消息时间戳
  var subType = attrs.subType || webim.GROUP_MSG_SUB_TYPE.REDPACKET;
  var msg = new webim.Msg(
    currentSession,
    true, seq, random, msgTime, attrs.msg.fromAccount, subType, '');
  var textObj = new webim.Msg.Elem('TIMCustomElem', {
    data: JSON.stringify(attrs.msg)
  });
  msg.fromAccount = this.im.imIdentifier;
  msg.elems.push(textObj);
  webim.sendMsg(msg, function (resp) {
    defer.resolve(resp);
  }, function (err) {
    defer.reject(err);
  });

  return defer.promise();
};


/**
 * 清屏
 */
imServer.clearScreen = function (args) {
  this.sendMessage(args);
};

/**
 * 锁屏
 */
imServer.lockScreen = function () {
  console.log('IM lock');
};

/**
 * 禁言
 // options = {
    //     'GroupId': '',
    //     'Members_Account': [],
    //     'ShutUpTime': time
    // };
 */
imServer.disableSendMsg = function (options, okFn, errFn) {
  var time = webim.Tool.formatTimeStamp(Math.round(new Date().getTime() / 1000) + 10 * 60);
  var ops;

  time = new Date(time + '').getTime();
  ops = _.extend({
    ShutUpTime: time
  }, options);

  webim.forbidSendMsg(
    ops,
    function (resp) {
      if (okFn) {
        okFn(resp);
      }
    },
    function (err) {
      if (errFn) {
        errFn(err);
      }
    }
  );
};

/**
 * 踢人
 * options : {GroupId: '', MemberToDel_Account: []}
 */
imServer.removeUserFromGroup = function (options, okFn, errFn) {
  if (!options || !options.GroupId || options.MemberToDel_Account.length <= 0) {
    if (errFn) {
      errFn({
        msg: '参数不正确'
      });
    }
  }
  webim.deleteGroupMember(
    options,
    function (resp) {
      if (okFn) {
        okFn(resp);
      }
    },
    function (err) {
      if (errFn) {
        errFn(err);
      }
    }
  );
};

/**
 * 消息通知回调
 */
imServer.msgNotify = function () {

};

/**
 * 获取群组消息
 */
imServer.getRoomMsgs = function (callback) {
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
  if (callback) {
    callback.call(this, data);
  }
};

/**
 * 创建聊天群
 */
imServer.createIMChatRoom = function (okFn, errFn) {
  var imSig = store.get('imSig');
  var options = {
    Owner_Account: imSig.imIdentifier,
    Type: 'ChatRoom', // Private/Public/ChatRoom
    Name: '测试聊天室',
    Notification: '',
    Introduction: '',
    MemberList: []
  };

  webim.createGroup(
    options,
    function (resp) {
      if (okFn) {
        okFn(resp);
      }
    },
    function (err) {
      if (errFn) {
        errFn(err);
      }
    }
  );
};

imServer.applyJoinGroup = function (groupId, okFn, errFn) {
  var options = {
    GroupId: groupId,
    ApplyMsg: '直播间',
    UserDefinedField: ''
  };
  webim.applyJoinGroup(
    options,
    function (resp) {
      if (okFn) {
        okFn(resp);
      }
    },
    function (err) {
      if (errFn) {
        errFn(err);
      }
    }
  );
};

/**
 * 获取群组消息
 * @param groupId
 * @param okFn
 * @param errFn
 */
imServer.getGroupInfo = function (groupId, okFn, errFn) {
  var options = {
    GroupIdList: [
      groupId
    ],
    GroupBaseInfoFilter: [
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
    MemberInfoFilter: [
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
      if (okFn) {
        okFn(resp);
      }
    },
    function (err) {
      if (errFn) {
        errFn(err);
      }
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
imServer.modifyGroupInfo = function (options, okFn, errFn) {
  webim.modifyGroupBaseInfo(
    options,
    function (resp) {
      if (okFn) {
        okFn(resp);
      }
    },
    function (err) {
      if (errFn) {
        errFn(err);
      }
    }
  );
};

/**
 * 修改组内成员角色
 */
imServer.modifyGroupMember = function (ops) {
  var defer = $.Deferred();
  console.log(ops);
  var options = _.extend({
    GroupId: '',
    Member_Account: '',
    Role: ''
  }, ops);
  webim.modifyGroupMember(
    options,
    function (resp) {
      defer.resolve(resp);
    },
    function (err) {
      defer.reject(err);
    }
  );
  return defer.promise();
};

module.exports = imServer;
