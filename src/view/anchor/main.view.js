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
var UserModel = require('UserModel');
var RoomDetailModel = require('../../model/anchor/room-detail.model');
var URL = require('url');

var user = UserModel.sharedInstanceUserModel();

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
    /**
     * 校验用户
     */
    userVerify: function () {
        var self = this;
        if (user.isLogined()) {
            this.roomDetail.setChangeURL({
                accessToken: user.getToken(),
                roomId: this.roomId
            });

            self.initRoom();
            self.renderPage();
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