/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var uiConfirm = require('ui.Confirm');
var DateTime = require('DateTime');
var FlashAPI = require('FlashAPI');
var msgBox = require('ui.MsgBox');
var YYTIMServer = require('../../lib/YYT_IM_Server');
var RoomDetailModel = require('../../model/anchor/room-detail.model');
var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var GiftModel = require('../../model/anchor/gift.model');
//var Storage = require('store');
var UserInfo = require('./user.js');


var View = BaseView.extend({
    el: '#anchorCtrlChat', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/live-room/chat.html');
    },
    events: { //监听事件

    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.elements = {};
    },
    //当模板挂载到元素之后
    afterMount: function () {
        var el = this.$el;
        this.elements = {
            msgList: el.find('#msgList'),
            chatHistory: el.find('#chatHistory')
        };

        this.giftModel = GiftModel.sigleInstance();
        this.roomDetail = RoomDetailModel.sigleInstance();

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.flashAPI = FlashAPI.sharedInstanceFlashAPI({
            el: 'broadCastFlash'
        });
        this.defineEventInterface();
    },
    defineEventInterface: function () {
        var self = this;
        Backbone.on('event:roomInfoReady', function (data) {
            if (data) {
                self.roomInfo = data;
                self.checkUserCanJoinRoom();
            }
        });

        Backbone.on('event:onMsgNotify', function (notifyInfo) {
            if (notifyInfo && notifyInfo.constructor.name == 'Array') {
                for (var i = 0, len = notifyInfo.length; i < len; i++) {
                    self.onMsgNotify(notifyInfo[i]);
                }
            } else {
                self.onMsgNotify(notifyInfo);
            }
        });
        Backbone.on('event:onGroupInfoChangeNotify', function (notifyInfo) {
            self.onGroupInfoChangeNotify(notifyInfo);
        });
        Backbone.on('event:groupSystemNotifys', function (notifyInfo) {
            self.groupSystemNotifys(notifyInfo);
        });

        Backbone.on('event:visitorSendMessage', function (data) {
            if (UserInfo.isDisbaleTalk()) {
                msgBox.showTip('您已经被禁言,暂时无法操作');
            } else if (UserInfo.isLockScreen(self.roomInfo.id)) {
                msgBox.showTip('主播进行了锁屏,暂时无法互动');
            } else {
                self.beforeSendMsg(data);
            }
        });
        Backbone.on('event:forbidUserSendMsg', function (data) {
            self.forbidUserSendMsgHandler(data);
        });
        Backbone.on('event:currentUserInfoReady', function (userInfo) {
            if (userInfo) {
                self.currentUserInfo = userInfo;
            }
        });

        Backbone.on('event:IMGroupInfoReady', function (info) {
            self.currentGroupInfo = info;
        });

    },

    onMsgNotify: function (notifyInfo) {
        var self = this;
        var msgObj = {};

        if (notifyInfo && notifyInfo.type == 0 && notifyInfo.elems && notifyInfo.elems.length > 0) {
            msgObj = notifyInfo.elems[0].content.text + '';
            msgObj = msgObj.replace(/&quot;/g, '\'');
            eval('msgObj = ' + msgObj);
            msgObj.fromAccount = notifyInfo.fromAccount;

            self.beforeSendMsg(msgObj);
        }
    },

    beforeSendMsg: function (msgObj) {
        var self = this;

        if (msgObj.roomId != this.roomInfo.id) {
            return;
        }

        switch (msgObj.mstType) {
            case 0: //文本消息
                self.addMessage(msgObj);
                break;
            case 1: //发送礼物
                var giftName = self.giftModel.findGift(msgObj.giftId).name || '礼物';
                msgObj.content = '<b>' + msgObj.nickName + '</b>向主播赠送' + giftName + '!';
                //msgObj.nickName = '消息';
                msgObj.smallAvatar = '';
                self.addMessage(msgObj);
                break;
            case 2: //公告
                Backbone.trigger('event:updateRoomNotice', msgObj);
                break;
            case 3: //点赞
                msgObj.content = '<b>' + msgObj.nickName + '</b>点赞一次!';
                //msgObj.nickName = '消息';
                msgObj.smallAvatar = '';
                self.addMessage(msgObj);
                break;
            case 4: // 清屏
                this.elements.msgList.children().remove();
                msgObj.content = '进行了清屏操作!';
                msgObj.smallAvatar = '';
                self.addMessage(msgObj);
                var msg = {
                    roomId: self.roomInfo.id,
                    nickName: '主播',
                    smallAvatar: '',
                    mstType: 4,
                    content: '主播已清屏'
                };
                self.flashAPI.onReady(function () {
                    this.notifying(msg);
                });

                break;
            case 5: // 禁言
                Backbone.trigger('event:forbidUserSendMsg', msgObj);
                break;
        }
    },
    onGroupInfoChangeNotify: function (notifyInfo) {
        if (notifyInfo && notifyInfo.GroupIntroduction) {
            var intro = JSON.parse(notifyInfo.GroupIntroduction);
            UserInfo.setLockScreen(this.roomInfo.id, intro.blockState);
            var msg = '主播进行了' + (intro.blockState ? '锁屏' : '解屏') + '操作';
            msgBox.showTip(msg);
            Backbone.trigger('event:LockScreen', intro.blockState);
        }
        if (notifyInfo && notifyInfo.GroupNotification) {
            var notify = JSON.parse(notifyInfo.GroupNotification);
            Backbone.trigger('event:UserKickOut', notify);
        }
    },
    groupSystemNotifys: function (notifyInfo) {
        //console.log(notifyInfo);
    },
    /**
     * 获取消息模板
     * @returns {*}
     */
    getMessageTpl: function () {
        return require('../../template/anchor/chat-message-tpl.html');
    },
    addMessage: function (msgObj) {
        var self = this;
        msgObj = _.extend({
            nickName: '匿名',
            content: '',
            smallAvatar: '',
            time: self.getDateStr(new Date()),
            fromAccount: ''
        }, msgObj);

        if (msgObj && msgObj.roomId !== self.roomInfo.id) {
            return;
        }
        msgObj.content = self.filterEmoji(msgObj.content);
        if (msgObj && msgObj.content) {
            var tpl = _.template(this.getMessageTpl());
            this.elements.msgList.append(tpl(msgObj));
            this.elements.chatHistory.scrollTop(this.elements.msgList.height());
            //if (msgObj.mstType == 0) {
                try {
                    this.flashAPI.onReady(function () {
                        console.log(msgObj);
                        this.notifying(msgObj);
                    });

                } catch (e) {

                }
            //}
        }
        YYTIMServer.sendMessage({
            groupId: this.roomInfo.imGroupid,
            msg: msgObj
        });
        self.autoDeleteMsgList();
    },
    filterEmoji: function (content) {
        var reg = /[\u4e00-\u9fa5\w\d@\.\-。_!^^+#【】！~“：《》？<>]/g;
        if (content) {
            var result = content.match(reg) || [];
            if (result.length > 0) {
                return result.join('') || '';
            }
            return '';
        }
        return content;
    },
    //动删除前面的,仅留下500条
    autoDeleteMsgList: function () {
        var total = this.elements.msgList.children().length,
            index = 0;
        if (total > 500) {
            index = total - 200;
        }
        this.elements.msgList.children(':lt(' + index + ')').remove();
    },
    //转换时间格式
    getDateStr: function (dateInt) {
        var date = new Date(dateInt);
        return date.Format('hh:mm:ss');
    },
    /**
     *
     groupId: this.roomInfo.imGroupid,
     msg: {
                roomId: this.roomInfo.id,
                smallAvatar: '',
                mstType: 2,
                content: content
            }
     */
    sendNotifyToIM: function (notifyInfo, okFn, errFn) {
        if (!this.roomInfo.imGroupid) {
            msgBox.showTip('直播尚未开始,请稍后重试');
            return;
        }
        YYTIMServer.sendMessage({
            groupId: this.roomInfo.imGroupid,
            msg: {
                roomId: this.roomInfo.id,
                smallAvatar: notifyInfo.smallAvatar || '',
                mstType: notifyInfo.smallAvatar,
                content: notifyInfo.smallAvatar
            }
        }, function (res) {
            okFn && okFn(res);
        }, function (err) {
            errFn && errFn(err);
        });
    },

    checkUserCanJoinRoom: function () {
        YYTIMServer.getGroupInfo(this.roomInfo.imGroupid, function (res) {
            if (res && res.ErrorCode == 0 || res.GroupInfo[0]) {
                var info = res.GroupInfo[0];

            }
        }, function (err) {

        });
    },
    checkUserStatus: function () {
        if (UserInfo.isDisbaleTalk()) {
            msgBox.showTip('您已经被禁言,暂无法操作');
            return false;
        }

        return false;
    },
    forbidUserSendMsgHandler: function (notifyInfo) {
        var imIdentifier = imModel.$get('data.imIdentifier');
        if (notifyInfo.userId === imIdentifier) {
            msgBox.showTip('您已被主播禁言10分钟!');
            Backbone.trigger('event:currentUserDisableTalk', true);
            //Storage.set('disableTalkTime', new Date());
            var cur = new Date();

            UserInfo.setDisableTalk(cur.getTime() + 10 * 60 * 1000);
        }
    }
});

module.exports = View;