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
var URL = require('url');
var uiConfirm = require('ui.Confirm');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var RoomDetailModel = require('../../model/anchor/room-detail.model');
var msgBox = require('ui.MsgBox');


var View = BaseView.extend({
    clientRender: false,
    el: '#anchorContainerBg', //设置View对象作用于的根元素，比如id
    events: { //监听事件

    },
    //当模板挂载到元素之前
    beforeMount: function () {
        var url = URL.parse(location.href);
        this.roomId = url.query['roomId'] || 1;

        this.roomDetail = RoomDetailModel.sigleInstance();

        this.roomDetailParams = {
            deviceinfo: '{"aid": "30001001"}',
            access_token: 'web-' + user.getToken(),
            roomId: ''
        };

    },
    //当模板挂载到元素之后
    afterMount: function () {

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.initRoom();

        this.renderPage();
    },

    renderPage: function () {
        var RoomTitle = require('./room-title.view');
        new RoomTitle();

        var ChatView = require('./chat.view');
        new ChatView();

        var SendMessageView = require('./send-message.view');
        new SendMessageView();

        var AnchorCardView = require('./anchor-card.view');
        new AnchorCardView();

        var PlayedListView = require('./played-list.view');
        new PlayedListView();

        var GiftView = require('./gift.view');
        new GiftView();

    },
    initWebIM: function () {
        var self = this;

        function callback(notifyInfo) {
            Backbone.trigger('event:groupSystemNotifys', notifyInfo);
        }

        //注册IM事件处理
        YYTIMServer.init({
            'onConnNotify': function (notifyInfo) {
                Backbone.trigger('event:onConnNotify', notifyInfo);
            },
            'onMsgNotify': function (notifyInfo) {
                Backbone.trigger('event:onMsgNotify', notifyInfo);
            },
            'onGroupInfoChangeNotify': function (notifyInfo) {
                Backbone.trigger('event:onGroupInfoChangeNotify', notifyInfo);
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
                "255": callback //用户自定义通知(默认全员接收,暂不支持)
            }
        });

    },
    initRoom: function () {
        var self = this,
            errFn = function(){
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
            };

        this.getRoomInfo(function (response) {
            var data = response.data || {};
            if (response && response.code == '0') {
                self.videoUrl = {
                    'streamName': data.streamName,
                    'url': data.url
                };
                //self.renderPage();
                Backbone.trigger('event:roomInfoReady', data);
                self.checkRoomStatus(data.status);
                //if (data.status == 2) {
                //    self.initWebIM();
                //}
            }else{
                errFn();
            }
        }, errFn);
    },
    getRoomInfo: function (okFn, errFn) {
        var self = this;
        self.roomDetailParams.roomId = self.roomId;
        this.roomDetail.executeJSONP(self.roomDetailParams, function (response) {
            okFn && okFn(response);
        }, function (err) {
            errFn && errFn(err);
        });
    },
    checkRoomStatus: function(status){
        switch (status){
            case 0:
                msgBox.showTip('该直播尚未发布!');
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
        }
    },
    goBack: function () {
        window.history.go(-1);
    }

});

module.exports = View;