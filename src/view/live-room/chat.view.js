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
            console.log(data);
        });

    },
    onMsgNotify: function (notifyInfo) {
        var self = this;
        var msgObj = {};

        if (notifyInfo && notifyInfo.elems && notifyInfo.elems.length > 0) {
            msgObj = notifyInfo.elems[0].content.text + '';
            msgObj = msgObj.replace(/&quot;/g, '\'');
            eval('msgObj = ' + msgObj);
            msgObj.fromAccount = notifyInfo.fromAccount;

            switch (msgObj.mstType) {
                case 0: //文本消息
                    self.addMessage(msgObj);
                    break;
                case 1: //发送礼物
                    msgObj.content = '<b>' + msgObj.nickName + '</b>向主播发送礼物!';
                    msgObj.nickName = '消息';
                    msgObj.smallAvatar = '';
                    self.addMessage(msgObj);
                    break;
                case 2: //公告
                    break;
                case 3: //点赞
                    msgObj.content = '<b>' + msgObj.nickName + '</b>点赞一次!';
                    msgObj.nickName = '消息';
                    msgObj.smallAvatar = '';
                    self.addMessage(msgObj);
                    break;
                case 4: // 清屏
                    break;
            }
        }
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
            time: self.getDateStr(new Date())
        }, msgObj);

        if (msgObj && msgObj.roomId !== self.roomInfo.id) {
            return;
        }
        msgObj.content = self.filterEmoji(msgObj.content);
        if (msgObj && msgObj.content) {
            var tpl = _.template(this.getMessageTpl());
            this.msgList.append(tpl(msgObj));
            this.chatHistory.scrollTop(this.msgList.height());
            if (msgObj.mstType == 0) {
                this.flashAPI.onReady(function () {
                    this.notifying(msgObj);
                });
            }
        }
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
        var total = this.msgList.children().length,
            index = 0;
        if (total > 1000) {
            index = total - 500;
        }
        this.msgList.children(':lt(' + index + ')').remove();
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

    }
});

module.exports = View;