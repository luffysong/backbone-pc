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
var YYTIMServer = require('../../lib/YYT_IM_Server');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomDetailModel = require('../../model/anchor/room-detail.model');
var URL = require('url');
var msgBox = require('ui.MsgBox');
var uiConfirm = require('ui.Confirm');


var View = BaseView.extend({
    clientRender: false,
    el: '#anchorContainerBg', //设置View对象作用于的根元素，比如id
    events: { //监听事件

    },
    //当模板挂载到元素之前
    beforeMount: function () {
        var url = URL.parse(location.href);
        this.roomId = url.query['roomId'] | 1;
        if (!this.roomId) {
            this.goBack();
        }
        this.roomDetail = new RoomDetailModel();

    },
    //当模板挂载到元素之后
    afterMount: function () {


    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.userVerify();
    },
    initWebIM: function () {
        var self = this;
        function callback(notifyInfo) {
            $(document).trigger('event:groupSystemNotifys', notifyInfo);
        }

        //注册IM事件处理
        YYTIMServer.init({
            'onConnNotify': function (notifyInfo) {
                console.log('1-onConnNotify', notifyInfo);
                $(document).trigger('event:onConnNotify', notifyInfo);
            },
            'onMsgNotify': function (notifyInfo) {
                console.log('2-onMsgNotify', notifyInfo);
                $(document).trigger('event:onMsgNotify', notifyInfo);
            },
            'onGroupInfoChangeNotify': function (notifyInfo) {
                console.log('3-onGroupInfoChangeNotify', notifyInfo);
                $(document).trigger('event:onGroupInfoChangeNotify', notifyInfo);
            },
            'groupSystemNotifys': {
                "1": callback, //申请加群请求（只有管理员会收到）
                "2": callback, //申请加群被同意（只有申请人能够收到）
                "3": callback, //申请加群被拒绝（只有申请人能够收到）
                "4": callback, //被管理员踢出群(只有被踢者接收到)
                "5": callback, //群被解散(全员接收)
                "6": callback, //创建群(创建者接收)
                "7": callback, //邀请加群(被邀请者接收)
                "8": callback, //主动退群(主动退出者接收)
                "9": callback, //设置管理员(被设置者接收)
                "10": callback, //取消管理员(被取消者接收)
                "11": callback, //群已被回收(全员接收)
                "255": callback//用户自定义通知(默认全员接收,暂不支持)
            }
        });

    },
    /**
     * 校验用户
     */
    userVerify: function () {
        var self = this;
        user.getUserInfo(function (u) {
            console.log('user:', u);
        });
        if (user.isLogined()) {

            self.initWebIM();

            //setTimeout(function () {
            self.roomDetail.setChangeURL({
                deviceinfo: JSON.stringify({"aid": "30001001"}),
                accessToken: user.getToken(),
                roomId: this.roomId
            });

            self.initRoom();
            self.renderPage();

            //}, 1000);

        } else {
            self.goBack();
        }
    },
    /**
     * 获取房间信息
     */
    initRoom: function () {
        var self = this;
        this.roomDetail.executeGET(function (data) {
            $(document).trigger('event:roomInfoReady', data.data);
        }, function (err) {
            uiConfirm.show({
                title: '提示',
                content: '获取房间数据失败!',
                okFn: function () {
                    self.goBack();
                },
                cancelFn: function () {
                    self.goBack();
                }
            });
        });
    },
    /**
     * 载入页面其他视图
     */
    renderPage: function () {
        //组件一，编辑背景图片
        var EditBgView = require('./anchor-edit-bg.view');
        new EditBgView();

        //组件二，主播信息
        var InfoView = require('./anchor-info.view');
        new InfoView();


        //组件三，主播控制消息
        var ChatView = require('./anchor-chat.view');
        new ChatView();

        //公告组件
        var NoticeView = require('./notice.view');
        new NoticeView();

        //直播开始,结束控制
        var LiveShowBtnView = require('./live-show-btn.view');
        new LiveShowBtnView();
    },
    goBack: function () {
        window.location.href = '/web/anchor-setting.html';
    }


});

module.exports = View;