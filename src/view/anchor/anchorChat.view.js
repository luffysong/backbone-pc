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
var URL = require('url');


var View = BaseView.extend({
    el: '#anchorCtrlChat', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor/chat.html');
    },
    events: { //监听事件
        'click #btn-clear': 'clearHandler',
        'click #btn-lock': 'lockHandler',
        'click #msgList': 'messageClickHandler'
    },
    //当模板挂载到元素之前
    beforeMount: function () {

    },
    //当模板挂载到元素之后
    afterMount: function () {
        //this.btnClear = $('#btn-clear');
        //背景图片元素
        this.themeBgEle = $('#anchorContainerBg');

        this.messageTpl = '';
        this.msgList = $('#msgList');
        this.chatHistory = $('#chatHistory');

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

        YYTIMServer.getRoomMsgs.call(this, this.renderGroupMsgs);

        //this.autoAddMsg();

    },
    //清屏
    clearHandler: function () {
        console.log('清');
        YYTIMServer.clearScreen();
    },
    //锁屏
    lockHandler: function () {
        console.log('锁');
        YYTIMServer.lockScreen();
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
        var target = $(e.target);
        console.log(target.text());
        if (target.text() === '禁言') {
            YYTIMServer.disableSendMsg();
        } else if (target.text() === '踢出') {
            YYTIMServer.removeUserFromGroup();
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
        console.log('onMsgNotify');

    },
    onGroupInfoChangeNotify: function (notifyInfo) {
        console.log('onGroupInfoChangeNotify');
    },
    groupSystemNotifys: function (notifyInfo) {
        console.log('groupSystemNotifys');
        console.log(notifyInfo);
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
     * 开始直播
     */
    startLiveShowHandler: function (data) {
        console.log(data);
        console.log(this);

        YYTIMServer.createIMChatRoom(function (res) {

        }, function (err) {

        });
    },
    /**
     * 定义对外公布的事件
     */
    defineEventInterface: function () {
        var self = this;
        //定义直播事件
        $(document).on('eventStartLiveShow', function (e, data) {
            self.startLiveShowHandler(data);
        });

    }
});

module.exports = View;