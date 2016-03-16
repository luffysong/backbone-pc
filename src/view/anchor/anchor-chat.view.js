/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time 2016-3-11
 * @author YuanXuJia
 * @info 聊天控制
 */

var BaseView = require('BaseView'); //View的基类
var YYTIMServer = require('../../lib/YYT_IM_Server');
var RoomMessageModel = require('../../model/anchor/room-message.model');
var StartLiveModel = require('../../model/anchor/start-live.model');
var EndLiveModel = require('../../model/anchor/end-live.model');
var RoomMsgModel = require('../../model/anchor/room-message.model');
var uiConfirm = require('ui.Confirm');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var DateTime = require('DateTime');

var msgBox = require('ui.MsgBox');

var View = BaseView.extend({
    el: '#anchorCtrlChat', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/chat.html');
    },
    events: { //监听事件
        'click #btn-clear': 'clearHandler',
        'click #btn-lock': 'lockClickHandler',
        'click #msgList': 'messageClickHandler'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.roomMsgModel = new RoomMessageModel();
        this.startLiveModel = new StartLiveModel();
        this.endLiveModel = new EndLiveModel();
        this.roomMsgModel = new RoomMessageModel();
        //标记是否开始直播
        this.isLiveShowing = false;
        //禁言用户列表
        this.forbidUsers = [];

        var self = this;

        function callback(notifyInfo) {
            self.groupSystemNotifys(notifyInfo);
        }

        //注册IM事件处理
        //YYTIMServer.init({
        //    listeners: {
        //        'onConnNotify': function(notifyInfo){
        //            console.log('1-onConnNotify', notifyInfo);
        //        },
        //        'onMsgNotify': function (notifyInfo) {
        //            alert(1);
        //            self.onMsgNotify(notifyInfo);
        //        },
        //        'onGroupInfoChangeNotify': function (notifyInfo) {
        //            self.onGroupInfoChangeNotify(notifyInfo);
        //        },
        //        'groupSystemNotifys': {
        //            "1": callback, //申请加群请求（只有管理员会收到）
        //            "2": callback, //申请加群被同意（只有申请人能够收到）
        //            "3": callback, //申请加群被拒绝（只有申请人能够收到）
        //            "4": callback, //被管理员踢出群(只有被踢者接收到)
        //            "5": callback, //群被解散(全员接收)
        //            "6": callback, //创建群(创建者接收)
        //            "7": callback, //邀请加群(被邀请者接收)
        //            "8": callback, //主动退群(主动退出者接收)
        //            "9": callback, //设置管理员(被设置者接收)
        //            "10": callback, //取消管理员(被取消者接收)
        //            "11": callback, //群已被回收(全员接收)
        //            "255": callback//用户自定义通知(默认全员接收,暂不支持)
        //        }
        //    }
        //});
    },
    //当模板挂载到元素之后
    afterMount: function () {
        var self = this;
        //this.btnClear = $('#btn-clear');
        //背景图片元素
        this.themeBgEle = $('#anchorContainerBg');

        this.messageTpl = '';
        this.msgList = $('#msgList');
        this.chatHistory = $('#chatHistory');
        this.btnLock = $('#btn-lock');

        this.defineEventInterface();


    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        //YYTIMServer.getRoomMsgs.call(this, this.renderGroupMsgs);

        //this.autoAddMsg();
    },
    //清屏
    clearHandler: function () {
        var self = this;
        uiConfirm.show({
            content: '您确定要清屏吗?',
            okFn: function () {
                self.clearMessageList();
                YYTIMServer.clearScreen();
            }
        });
    },
    //锁屏
    lockClickHandler: function () {
        var target = this.btnLock.children('span'),
            self = this,
            txt = target.text() == '锁屏' ? '锁定屏幕' : '解开屏幕';
        uiConfirm.show({
            content: '您确定要' + txt + '吗?',
            okFn: function () {
                self.lockIMHandler(target.text() == '锁屏');
            }
        });
    },
    lockIMHandler: function (isLock) {
        var self = this,
            options = {
                GroupId: this.roomInfo.imGroupid
            };
        if (isLock === true) {
            options.Introduction = JSON.stringify({
                blockState: !!isLock,
                alert: '播主设定锁定屏幕，不能发送弹幕及礼物'
            });
        } else {
            options.Introduction = JSON.stringify({
                blockState: false
            });
        }

        var txt = isLock === true ? '锁屏' : '解屏';
        YYTIMServer.modifyGroupInfo(options, function (result) {
            if (result && result.ActionStatus == 'OK') {
                self.btnLock.children('span').text(isLock === true ? '解屏' : '锁屏');
                msgBox.showOK(txt + '成功!');
            } else {
                msgBox.showError(txt + '操作失败,请稍后重试');
            }

        }, function (err) {
            console.log('modifyGroupInfo err', err);
            msgBox.showError(txt + '操作失败,请稍后重试');
        });
    },
    //清空消息
    clearMessageList: function () {
        this.msgList.children().remove();
    },
    //单击某用户发送的消息
    messageClickHandler: function (e) {
        var control, li;
        control = $(e.target).parent();
        if (control.hasClass('controls_forbid_reject')) {
            this.msgControlHandler(e);
        } else {
            li = $(e.target).parents('li');
            this.showMsgControlMenu(li);
        }

    },
    //显示,隐藏禁言/提出按钮
    showMsgControlMenu: function (target) {
        if (target.length <= 0) return;
        var control = target.find('.controls_forbid_reject'),
            index = $('#msgList li').index(target);

        $('.controls_forbid_reject').not(control).hide();
        if (index === 0) {
            control.css('margin-top', '33px');
        }
        control.toggle();
    },
    //禁言,或者踢出
    msgControlHandler: function (e) {
        var target = $(e.target), li;
        li = target.parents('li');

        if (target.text() === '禁言') {
            this.disableSendMsgConfirm({
                name: li.attr('data-name'),
                id: li.attr('data-id')
            });
        } else if (target.text() === '踢出') {
            this.removeUserFromRoom({
                name: li.attr('data-name'),
                id: li.attr('data-id')
            });
        }
    },
    /**
     * 禁止用户发言确认提示框
     */
    disableSendMsgConfirm: function (user) {
        var self = this;
        uiConfirm.show({
            content: '您确定要禁止用户:<b>' + user.name + '</b>发言吗?',
            okFn: function () {
                self.disableSendMsgHandler(user);
            }
        });
    },
    disableSendMsgHandler: function (user) {
        var self = this;
        if (self.forbidUsers.length > 200) {
            self.forbidUsers.shift();
        }
        self.forbidUsers.push(user.id);
        console.log('self.forbidUsers', self.forbidUsers);
        var options = {
            GroupId: self.roomInfo.imGroupid,
            Notification: JSON.stringify({
                forbidUsers: self.forbidUsers
            })
        };

        YYTIMServer.modifyGroupInfo(options, function (result) {

            console.log('disableSendMsgHandler', result);
        });
    },
    /**
     * 将用户从房间中移除
     */
    removeUserFromRoom: function (data) {
        var self = this,
            errTip = '将用户:<b>' + data.name + '</b>踢出房间失败,请稍后再试';
        var user = [];
        user.push(data.id);
        console.log('data.id', user);
        uiConfirm.show({
            content: '您确定要将用户:<b>' + data.name + '</b>踢出房间吗?',
            okFn: function () {
                YYTIMServer.removeUserFromGroup({
                    GroupId: self.roomInfo.imGroupid,
                    MemberToDel_Account: user
                }, okFn, function (err) {
                    msgBox.showError(errTip);
                });
            }
        });

        function okFn(resp) {
            if (resp.ActionStatus == 'OK') {
                msgBox.showOK('成功将用户:<b>' + data.name + '</b>踢出房间');
            } else {
                msgBox.showError(errTip);
            }
        }
    },
    renderGroupMsgs: function (datas) {
        var self = this;
        if (datas && datas.length > 0) {

        }
        for (var i = 0, j = datas.length; i < j; i++) {
            self.addMessage(datas[i]);
        }
    },
    onMsgNotify: function (notifyInfo) {
        console.log('onMsgNotify', notifyInfo);
        this.addMessage(notifyInfo);


    },
    onGroupInfoChangeNotify: function (notifyInfo) {
        console.log('onGroupInfoChangeNotify', notifyInfo);
    },

    groupSystemNotifys: function (notifyInfo) {
        console.log('groupSystemNotifys', notifyInfo);
    },
    /**
     * 获取消息模板
     * @returns {*}
     */
    getMessageTpl: function () {
        return require('../../template/anchor/chat-message-tpl.html');
    },
    /**
     * 添加消息
     * @constructor
     */
    addMessage: function (data) {
        var self = this;
        console.log(data);
        var msgObj = {};
        if (data.elems && data.elems.length > 0) {
            msgObj = data.elems[0].content.text + '';
            msgObj = msgObj.replace(/&quot;/g, '\'');
            eval('msgObj = ' + msgObj);
            msgObj = _.extend({
                nickName: '匿名',
                content: '',
                url: '',
                time: self.getDateStr(new Date())
            }, msgObj);

            if (msgObj && msgObj.content) {
                msgObj.fromAccount = data.fromAccount;
                var tpl = _.template(this.getMessageTpl());
                this.msgList.append(tpl(msgObj));
                this.chatHistory.scrollTop(this.msgList.height());
            }
        }
    },
    autoAddMsg: function () {
        var self = this;
        setInterval(function () {
            self.addMessage({
                name: '123123',
                msg: 'ppppp'
            });
        }, 1500);
    },
    /**
     * 开始直播按钮点击,创建群后开始直播
     */
    startLiveClick: function (data) {
        var self = this;

        if (!this.roomInfo) {
            console.log('没有获取到房间信息');
            return '';
        }
        if (!this.roomInfo.imGroupid) {
            YYTIMServer.createIMChatRoom(function (res) {
                console.log('createIMChatRoom=', res);
                self.roomInfo.imGroupid = res.GroupId;
                self.startLive();
            }, function (err) {

            });
        } else {
            self.startLive();
        }

    },
    /**
     * 开始直播
     */
    startLive: function () {
        var self = this;
        self.startLiveModel.setChangeURL({
            deviceinfo: JSON.stringify({"aid": "30001001"}),
            accessToken: user.getToken(),
            roomId: self.roomInfo.id,
            imGroupId: encodeURIComponent(self.roomInfo.imGroupid)
        });
        self.startLiveModel.executeGET(function (result) {
            console.log('start live', result);
            self.isLiveShowing = true;
            msgBox.showOK('成功开启直播');

        }, function (err) {
            console.log(err);
            msgBox.showError(err.msg);
        });
    },
    /**
     * 点击结束直播
     * @param data
     */
    endLiveClick: function (data) {
        var self = this;
        self.endLiveModel.setChangeURL({
            deviceinfo: '{"aid": "30001001"}',
            accessToken: user.getToken(),
            roomId: self.roomInfo.id
        });

        self.endLiveModel.executeGET(function (result) {
            console.log('endLiveClick = ', result);
            self.isLiveShowing = false;
            $(document).trigger('event:liveShowEnded');
        }, function (err) {
            console.log(err);
            msgBox.showError(err.msg);
        });
    },
    /**
     * 定义对外公布的事件
     */
    defineEventInterface: function () {
        var self = this;
        //定义直播事件
        $(document).on('eventStartLiveShow', function (e, data) {
            self.startLiveClick(data);
        });
        //结束直播
        $(document).on('event:endLiveShow', function (e, data) {
            self.endLiveClick(data);
        });

        //成功获取房间信息
        $(document).on('event:roomInfoReady', function (e, data) {

            if (data) {
                self.roomInfo = data;
                self.roomInfoReady();
            }
            console.log('chat', data);
        });

        $(document).on('event:onConnNotify', function (e, notifyInfo) {

            //self.onConnNotify(notifyInfo);
        });
        $(document).on('event:onMsgNotify', function (e, notifyInfo) {
            self.onMsgNotify(notifyInfo);
        });
        $(document).on('event:onGroupInfoChangeNotify', function (e, notifyInfo) {
            self.onGroupInfoChangeNotify(notifyInfo);
        });
        $(document).on('event:groupSystemNotifys', function (e, notifyInfo) {
            self.groupSystemNotifys(notifyInfo);
        });

    },
    /**
     *
     */
    roomInfoReady: function () {
        var self = this;
        self.getMessageFromServer();
        self.getGroupInfo();

    },
    /**
     *
     */
    getMessageFromServer: function () {
        var self = this;
        self.roomMsgModel.setChangeURL({
            deviceinfo: '{"aid": "30001001"}',
            accessToken: user.getToken(),
            limit: 100,
            endTime: 0,
            startTime: 0,
            cursor: '',
            roomId: self.roomInfo.id
        });

        self.roomMsgModel.executeGET(function (result) {
            console.log('roomMsgModel', result);
        }, function (err) {
            console.log(err);
        });
    },
    /**
     * 获取群组公告以及介绍
     */
    getGroupInfo: function () {
        var self = this;

        YYTIMServer.getGroupInfo(self.roomInfo.imGroupid, function (result) {
            console.log('getGroupInfo', result);
            if (result && result.ActionStatus === 'OK') {
                if (result.GroupInfo && result.GroupInfo[0] && result.GroupInfo[0].Introduction) {
                    var intro = JSON.parse(result.GroupInfo[0].Introduction);
                    if (intro && intro.blockState === true) {
                        self.btnLock.children('span').text('解屏');
                    }
                }
            }
        }, function (err) {
            console.log(err);
            msgBox.showError(err.msg || '获取群组消息失败!');
        });
    },
    getDateStr: function (dateInt) {
        var date = new Date(dateInt);
        return date.Format('hh:MM:ss');
    }

});

module.exports = View;