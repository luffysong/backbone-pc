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
var LoginBox = require('LoginBox');
var user = UserModel.sharedInstanceUserModel();
var sginHTML = require('../template/sgin.html');
var loginedTemp = require('../template/logined.html');
var win = window;
var View = BaseView.extend({
	clientRender:false,
	el:'#loginUser', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click #login':'loginHandler',
		'click .show-drop-menu': 'showDropMenu'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this._dialog = null;
	},
	//当模板挂载到元素之后
	afterMount:function(){
		this.loginBox = LoginBox();
		this._dialog = this.loginBox.dialog;

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		if (user.isLogined()) { //已经登录
			this.fetchUserInfo();
			
		}else{
			//未登录
			this.$el.html(sginHTML);
		}
		this.hideDropMenu();
	},
	loginHandler:function(e){
		e.preventDefault();
		var self = this;
		var status = this._dialog.status();
		if (status === 'hide') {
			this._dialog.trigger('show');
			this._dialog.once('hide',function(){
				if (user.isLogined()) {
					self.fetchUserInfo();
				};
			});
		}else{
			this._dialog.trigger('hide');
		}
	},
	fetchUserInfo:function(){
		var loginedHTML = this.compileHTML(loginedTemp,{
			'userName':user.$get('userName'),
			'bigheadImg':user.$get('bigheadImg')
		});
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
			self.showDropMenuEle&&self.showDropMenuEle.hide();
		});
	}
});

module.exports = View;