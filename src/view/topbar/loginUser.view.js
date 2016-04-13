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
var user = UserModel.sharedInstanceUserModel();
var LoginBox = require('LoginBox');
var sginHTML = require('../../template/topbar/sgin.html');
var loginedTemp = require('../../template/topbar/logined.html');
var store = require('store');
var win = window;
var location = win.location;
var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();


var View = BaseView.extend({
    clientRender: false,
    el: '#loginUser', //设置View对象作用于的根元素，比如id
    events: { //监听事件
        'click #login': 'loginHandler',
        'click .show-drop-menu': 'showDropMenu',
        'click #logout': 'logoutHandler',
        'mouseover .hoverMenu': 'nameHover',
        'mouseout .hoverMenu': 'nameOut'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this._dialog = null;
    },
    //当模板挂载到元素之后
    afterMount: function () {
        this.loginBox = LoginBox();
        this._dialog = this.loginBox.dialog;
        this.userDromMenu = this.$el.find('.pcNav');
    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        if (user.isLogined()) { //已经登录
            this.fetchUserInfo();
        } else {
            //未登录
            this.$el.html(sginHTML);
        }
        this.hideDropMenu();
        this.defineEventInterface();
    },
    /**
     * [loginHandler 处理登录按钮]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    loginHandler: function (e) {
        e.preventDefault();
        var self = this;
        var status = this._dialog.status();
        if (status === 'hide') {
            this._dialog.trigger('show');
            this._dialog.once('hide', function () {
                if (user.isLogined()) {
                    self.fetchUserInfo();
                    self.trigger('topbar-logined');
                };
            });
        } else {
            this._dialog.trigger('hide');
        }
    },
    /**
     * [logoutHandler 退出]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    logoutHandler: function (e) {
        store.remove('imSig');
        store.set('signout', 1);
        location.href = '/web/login.html'
    },
    fetchUserInfo: function () {
        var self = this;
        imModel.fetchIMUserSig(function (userImInfo) {
            if(userImInfo.roleType === 2){
                //游客，未登录
                self.$el.html(sginHTML);
            }else{
                var data = {
                    'userName': userImInfo.nickName,
                    'bigheadImg': userImInfo.largeAvatar
                };
                self.render(data);
            }
        });
    },
    render: function (data) {
        var loginedHTML = this.compileHTML(loginedTemp, data);
        this.$el.html(loginedHTML);
        this.showDropMenuEle = $('.loginMsg .pcNav');
    },
    /**
     * 显示下拉菜单
     */
    showDropMenu: function (e) {
        e.preventDefault();
        this.showDropMenuEle.toggle();
        return false;
    },
    /**
     * 隐藏下拉菜单
     */
    hideDropMenu: function () {
        var self = this;
        $(document).on('click', function () {
            self.showDropMenuEle && self.showDropMenuEle.hide();
        });
    },
    showDialog: function () {
        var self = this;
        this._dialog.trigger('show');
        this._dialog.once('hide', function () {
            if (user.isLogined()) {
                self.trigger('topbar-logined');
            }
            ;
        });
    },
    hideDialog: function () {
        this._dialog.trigger('hide');
    },
    /**
     * 定义对外公布的事件
     */
    defineEventInterface: function () {
        var self = this;
        Backbone.on('event:userProfileChanged', function (user) {
            var data = {
                'userName': user.nickName,
                'bigheadImg': user.headImg
            };
            self.render(data);
        });
    },
	nameHover: function(){
		this.showDropMenuEle.show();
	},
	nameOut: function(){
		this.showDropMenuEle.hide();
	}
});

module.exports = View;
