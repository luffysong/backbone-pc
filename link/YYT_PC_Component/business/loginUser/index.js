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
var sginHTML = require('./template/sgin.html');
var loginedTemp = require('./template/logined.html');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var LoginBox = require('LoginBox');
var View = BaseView.extend({
	clientRender:false,
	el:'#loginUser', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click #login':'loginHandler',
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
			
		}else{
			//未登录
			this.$el.html(sginHTML);
			this._dialog.once('hide', function() {
				self.loginedRender();
			});
		}
	},
	loginHandler:function(e){
		e.preventDefault();
		var status = this._dialog.status();
		if (status === 'hide') {
			this._dialog.trigger('show');
		}else{
			this._dialog.trigger('hide');
		}
	},
	loginedRender:function(){
		console.log('1');
	}
});

module.exports = View;