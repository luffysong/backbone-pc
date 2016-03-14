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
    },
    //当模板挂载到元素之后
    afterMount: function () {
        //this.btnClear = $('#btn-clear');
        //背景图片元素
        this.themeBgEle = $('#anchorContainerBg');

        this.messageTpl = '';
        this.msgList = $('#msgList');
        this.chatHistory = $('#chatHistory');
        this.btnLock = $('#btn-lock');

        this.defineEventInterface();


        //注册IM事件处理
        YYTIMServer.init({
            listeners: {
                onMsgNotify: this.onMsgNotify,
                onGroupInfoChangeNotify: this.onGroupInfoChangeNotify,
                groupSystemNotifys: {
                    "1": this.groupSystemNotifys, //申请加群请求（只有管理员会收到）
                    "2": this.groupSystemNotifys, //申请加群被同意（只有申请人能够收到）
                    "3": this.groupSystemNotifys, //申请加群被拒绝（只有申请人能够收到）
                    "4": this.groupSystemNotifys, //被管理员踢出群(只有被踢者接收到)
                    "5": this.groupSystemNotifys, //群被解散(全员接收)
                    "6": this.groupSystemNotifys, //创建群(创建者接收)
                    "7": this.groupSystemNotifys, //邀请加群(被邀请者接收)
                    "8": this.groupSystemNotifys, //主动退群(主动退出者接收)
                    "9": this.groupSystemNotifys, //设置管理员(被设置者接收)
                    "10": this.groupSystemNotifys, //取消管理员(被取消者接收)
                    "11": this.groupSystemNotifys, //群已被回收(全员接收)
                    "255": this.groupSystemNotifys//用户自定义通知(默认全员接收,暂不支持)
                }
            }
        });
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
        console.log('锁');
        var target = this.btnLock.children('span'),
            self = this;
        if (target.text() == '锁屏') {
            uiConfirm.show({
                content: '您确定要锁定屏幕吗?',
                okFn: function () {
                    self.lockIMHandler(true);
                }
            });
        } else {
            self.lockIMHandler(false);
        }
    },
    lockIMHandler: function (isLock) {
        var self = this,
            options = {
                GroupId: this.roomInfo.imGroupid
            };
        if (isLock == true) {
            options.Introduction = JSON.stringify({
                blockState: !!isLock,
                alert: '播主设定锁定屏幕，不能发送弹幕及礼物'
            });
        } else {
            options.Introduction = JSON.stringify({
                blockState: false
            });
        }

        YYTIMServer.modifyGroupInfo(options, function (result) {
            var txt = isLock == true ? '锁屏' : '解屏';
            if (result && result.ActionStatus == 'OK') {
                self.btnLock.children('span').text(isLock == true ? '解屏' : '锁屏');
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
            this.disableSendMsgHandler({
                name: li.attr('data-name')
            });
        } else if (target.text() === '踢出') {
            this.removeUserFromRoom({
                name: li.attr('data-name')
            });
        }
    },
    /**
     * 禁止用户发言
     * @param data
     */
    disableSendMsgHandler: function (data) {
        var self = this;
        uiConfirm.show({
            content: '您确定要禁止用户:<b>' + data.name + '</b>发言吗?',
            okFn: function () {
                YYTIMServer.disableSendMsg({
                    GroupId: self.roomInfo.imGroupid
                });
            }
        });
    },
    /**
     * 将用户从房间中移除
     */
    removeUserFromRoom: function (data) {
        var self = this;
        uiConfirm.show({
            content: '您确定要将用户:<b>' + data.name + '</b>踢出房间吗?',
            okFn: function () {
                YYTIMServer.removeUserFromGroup({
                    GroupId: self.roomInfo.imGroupid
                });
            }
        });
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
        var tpl = _.template(this.getMessageTpl());
        this.msgList.append(tpl(data));
        this.chatHistory.scrollTop(this.msgList.height());
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
            if(result && result.ActionStatus === 'OK'){
                if(result.GroupInfo && result.GroupInfo[0]){
                    var intro = JSON.parse(result.GroupInfo[0].Introduction);
                    if(intro && intro.blockState == true){
                        self.btnLock.children('span').text('解屏');
                    }
                }
            }
        }, function (err) {
            console.log(err);
            msgBox.showError(err.msg || '获取群组消息失败!');
        });
    }

});

module.exports = View;