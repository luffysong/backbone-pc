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
var uiConfirm = require('ui.Confirm');
var DateTime = require('DateTime');
var FlashAPI = require('FlashAPI');
var RoomDetailModel = require('../../model/anchor/room-detail.model');

var msgBox = require('ui.MsgBox');

var View = BaseView.extend({
    el: '#anchorCtrlChat', //设置View对象作用于的根元素，比如id
    rawLoader: function() { //可用此方法返回字符串模版
        return require('../../template/anchor/chat.html');
    },
    events: { //监听事件
        'click #btn-clear': 'clearHandler',
        'click #btn-lock': 'lockClickHandler',
        'click #msgList': 'messageClickHandler'
    },
    //当模板挂载到元素之前
    beforeMount: function() {
        //禁言用户列表
        this.forbidUsers = [];

        this.roomDetail = RoomDetailModel.sigleInstance();
        this.roomInfo = this.roomDetail.$get().data || {};

    },
    //当模板挂载到元素之后
    afterMount: function() {
        var el = this.$el;
        this.msgList = el.find('#msgList');
        this.chatHistory = el.find('#chatHistory');
        this.btnLock = el.find('#btn-lock');
        this.defineEventInterface();
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function() {
        this.roomInfoReady();
        this.flashAPI = FlashAPI.sharedInstanceFlashAPI({
            el: 'broadCastFlash'
        });
    },
    //清屏
    clearHandler: function() {
        var self = this;
        var flag = self.checkLiveRoomReady();
        if (!flag) {
            return;
        }

        uiConfirm.show({
            content: '您确定要清屏吗?',
            okFn: function() {
                var msg = {
                    roomId: self.roomInfo.id,
                    nickName: '主播',
                    smallAvatar: '',
                    mstType: 4,
                    content: '主播已清屏'
                };
                self.flashAPI.onReady(function() {
                    this.notifying(msg);
                });
                YYTIMServer.clearScreen({
                    groupId: self.roomInfo.imGroupid,
                    msg: msg
                });
            }
        });
    },
    //锁屏
    lockClickHandler: function() {
        var flag = this.checkLiveRoomReady();
        if (!flag) {
            return;
        }
        var target = this.btnLock.children('span'),
            self = this,
            txt = target.text() == '锁屏' ? '锁定屏幕' : '解开屏幕';
        uiConfirm.show({
            content: '您确定要' + txt + '吗?',
            okFn: function() {
                self.lockIMHandler(target.text() == '锁屏');
            }
        });
    },
    lockIMHandler: function(isLock) {
        var self = this,
            options = {
                GroupId: this.roomInfo.imGroupid
            };
        if (isLock === true) {
            options.Introduction = JSON.stringify({
                blockState: !!isLock,
                alert: '主播已锁屏'
            });
        } else {
            options.Introduction = JSON.stringify({
                blockState: false,
                alert: '主播解除锁屏'
            });
        }

        var txt = isLock === true ? '锁屏' : '解屏';
        YYTIMServer.modifyGroupInfo(options, function(result) {
            if (result && result.ActionStatus == 'OK') {
                self.btnLock.children('span').text(isLock === true ? '解屏' : '锁屏');
                msgBox.showOK(txt + '成功!');
            } else {
                msgBox.showError(txt + '操作失败,请稍后重试');
            }

        }, function(err) {
            msgBox.showError(txt + '操作失败,请稍后重试');
        });
    },
    //清空消息
    clearMessageList: function() {
        this.msgList.children().remove();
    },
    //单击某用户发送的消息
    messageClickHandler: function(e) {
        var control, li;
        control = $(e.target).parent();
        if (control.hasClass('controls_forbid_reject')) {
            this.msgControlHandler(e);
        } else {
            li = $(e.target).parents('li');
            //确认是文本消息
            if (li.attr('data-msgType') == 0) {
                this.showMsgControlMenu(li);
            }
        }

    },
    //显示,隐藏禁言/踢出按钮
    showMsgControlMenu: function(target) {
        if (target.length <= 0) return;

        var control = target.find('.controls_forbid_reject'),
            index = $('#msgList').find('li').index(target);

        $('.controls_forbid_reject').not(control).hide();
        if (index === 0) {
            control.css('margin-top', '33px');
        }
        control.toggle();
    },
    //禁言,或者踢出
    msgControlHandler: function(e) {
        var target = $(e.target),
            li, userInfo = {};

        li = target.parents('li');
        userInfo = {
            name: li.attr('data-name'),
            id: li.attr('data-id')
        };

        if (target.text() === '禁言') {
            this.disableSendMsgConfirm(userInfo);
        } else if (target.text() === '踢出') {
            this.removeUserFromRoom(userInfo);
        }
    },
    /**
     * 禁止用户发言确认提示框
     */
    disableSendMsgConfirm: function(user) {
        var self = this;
        uiConfirm.show({
            content: '您确定要禁止用户:<b>' + user.name + '</b>发言吗?',
            okFn: function() {
                self.disableSendMsgHandler(user);
            }
        });
    },
    disableSendMsgHandler: function(user) {
        var self = this,
            users = [];
        users.push(user.id);
        YYTIMServer.sendMessage({
            groupId: self.roomInfo.imGroupid,
            msg: {
                roomId: self.roomInfo.id,
                mstType: 5,
                userId: user.id
            }
        }, function(resp) {
            msgBox.showOK('已将用户:<b>' + user.name + ' 禁言10分钟.');
            self.flashAPI.onReady(function() {
                this.notifying({
                    roomId: self.roomInfo.id,
                    userId: user.id,
                    nickName: user.name,
                    mstType: 5
                });
            });
        }, function(err) {
            msgBox.showError('禁言失败,请稍后重试!');
        });
    },
    hideUserControl: function() {
        $('.controls_forbid_reject').hide();
    },
    /**
     * 将用户从房间中移除
     */
    removeUserFromRoom: function(data) {
        var self = this;
        uiConfirm.show({
            content: '您确定要将用户:<b>' + data.name + '</b>踢出房间吗?',
            okFn: function() {
                okFn();
            }
        });

        function okFn() {
            if (self.forbidUsers.length > 200) {
                self.forbidUsers.shift();
            }
            self.forbidUsers.push(data.id);
            var options = {
                GroupId: self.roomInfo.imGroupid,
                Notification: JSON.stringify({
                    forbidUsers: self.forbidUsers
                })
            };

            YYTIMServer.modifyGroupInfo(options, function(result) {
                if (result && result.ActionStatus === 'OK') {
                    msgBox.showOK('成功将用户:<b>' + data.name + '</b>踢出房间');
                } else {
                    msgBox.showError('将用户:<b>' + data.name + '</b>踢出房间失败,请稍后再试');
                }
            })
        }
    },
    //腾讯IM消息到达回调
    onMsgNotify: function(notifyInfo) {
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
                    msgObj.content = '<b>' + msgObj.nickName + '</b>发来礼物!';
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
    onGroupInfoChangeNotify: function(notifyInfo) {
        //
    },
    groupSystemNotifys: function(notifyInfo) {
        //
    },
    /**
     * 获取消息模板
     * @returns {*}
     */
    getMessageTpl: function() {
        return require('../../template/anchor/chat-message-tpl.html');
    },
    /**
     * 添加消息
     * @constructor
     */
    addMessage: function(msgObj) {
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
                this.flashAPI.onReady(function() {
                    this.notifying(msgObj);
                });
            }
        }
        self.autoDeleteMsgList();
    },
    /**
     * 过滤表情
     * @param  {[type]} content [description]
     * @return {[type]}         [description]
     */
    filterEmoji: function(content){
        var reg = /[\u4e00-\u9fa5\w\d@\.\-。_!^^+#【】！~“：《》？<>]/g;
        if(content){
            var result = content.match(reg) || [];
            if(result.length > 0){
                return result.join('') || '';
            }
            return '';
        }
        return content;
    },
    //当消息条数超过1000自动删除前面的,仅留下500条
    autoDeleteMsgList: function() {
        var total = this.msgList.children().length,
            index = 0;
        if (total > 1000) {
            index = total - 500;
        }
        this.msgList.children(':lt(' + index + ')').remove();
    },
    /**
     * 定义对外公布的事件
     */
    defineEventInterface: function() {
        var self = this;

        Backbone.on('event:onMsgNotify', function(notifyInfo) {
            if (notifyInfo && notifyInfo.constructor.name == 'Array') {
                for (var i = 0, len = notifyInfo.length; i < len; i++) {
                    self.onMsgNotify(notifyInfo[i]);
                }
            } else {
                self.onMsgNotify(notifyInfo);
            }
        });
        Backbone.on('event:onGroupInfoChangeNotify', function(notifyInfo) {
            self.onGroupInfoChangeNotify(notifyInfo);
        });
        Backbone.on('event:groupSystemNotifys', function(notifyInfo) {
            self.groupSystemNotifys(notifyInfo);
        });

    },
    /**
     *
     */
    roomInfoReady: function() {
        this.getGroupInfo();
    },
    /**
     * 从服务器端拉去消息
     */
    getMessageFromServer: function() {},
    /**
     * 获取群组公告以及介绍
     */
    getGroupInfo: function() {
        var self = this;

        YYTIMServer.getGroupInfo(self.roomInfo.imGroupid, function(result) {
            if (result && result.ActionStatus === 'OK') {
                if (result.GroupInfo && result.GroupInfo[0] && result.GroupInfo[0].Introduction) {
                    var intro = JSON.parse(result.GroupInfo[0].Introduction);
                    if (intro && intro.blockState === true) {
                        self.btnLock.children('span').text('解屏');
                    }
                }
            }
        }, function(err) {
            msgBox.showError(err.msg || '获取群组消息失败!');
        });
    },
    //转换时间格式
    getDateStr: function(dateInt) {
        var date = new Date(dateInt);
        return date.Format('hh:mm:ss');
    },
    //检查当前直播状态
    checkLiveRoomReady: function() {
        switch (this.roomInfo.status) {
            case 0:
                msgBox.showTip('该直播尚未发布!');
                return false;
            case 1:
            case 2:
                if (!this.roomInfo || !this.roomInfo.imGroupid) {
                    msgBox.showTip('请先开始直播!');
                    return false;
                }
                return true;
            case 3:
                msgBox.showTip('该直播已经结束!');
                return false;
        }
    }

});

module.exports = View;