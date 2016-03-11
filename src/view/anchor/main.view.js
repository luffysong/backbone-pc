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
var IMModel = require('../../lib/IMModel');
var UserModel = require('UserModel');
var store = require('store');

var user = UserModel.sharedInstanceUserModel();

var View = BaseView.extend({
    clientRender: false,
    el: '#anchorContainerBg', //设置View对象作用于的根元素，比如id
    events: { //监听事件

    },
    //当模板挂载到元素之前
    beforeMount: function () {

        this.imModel = IMModel.sharedInstanceIMModel();

    },
    //当模板挂载到元素之后
    afterMount: function () {

        this.userVerify();
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {

        this.renderPage();
    },
    /**
     * 校验用户
     */
    userVerify: function () {
        var self = this;
        if (user.isLogined()) {
            var a = store.get('imSig');
            console.log(a);
            //self.imModel.fetchIMUserSig(function (info) {
            //  console.log(info);
            //
            //});

        } else {
            //alert('尚未登录');
            window.location.href = '/web/anchor-setting.html';
        }
    },
    /**
     * 载入页面其他视图
     */
    renderPage: function () {
        //组件一，编辑背景图片
        var EditBgView = require('./anchorEditBg.view');
        new EditBgView();

        //组件二，主播信息
        var InfoView = require('./anchorInfo.view');
        new InfoView();


        //组件三，主播控制消息
        var ChatView = require('./anchorChat.view');
        new ChatView();

        //公告组件
        var NoticeView = require('./notice.view');
        new NoticeView();

        //直播开始,结束控制
        var LiveShowBtnView = require('./liveShowBtn.view');
        new LiveShowBtnView();

    }


});

module.exports = View;