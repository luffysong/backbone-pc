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
var LoginUserView = require('./loginUser.view');
var View = BaseView.extend({
	clientRender:false,
	el:'#topBar', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.loginUserView = new LoginUserView();
	},
	//当模板挂载到元素之后
	afterMount:function(){
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.loginUserView.on('topbar-logined',function(){
			self.trigger('logined');
		});
	},
	showLoginDialog:function(){
		this.loginUserView.showDialog();
	},
	hideLoginDialog:function(){
		this.loginUserView.hideDialog();
	}
});

var shared = null;
View.sharedInstanceTopBarView = function(){
	if (!shared) {
		shared = new View();
	};
	return shared;
};
module.exports = View;
