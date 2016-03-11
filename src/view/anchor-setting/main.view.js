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
var TopBarView = require('../topbar/topbar.view');
var IMModel = require('../../lib/IMModel');
var store = require('store');

var View = BaseView.extend({
	clientRender:false,
	el:'#anchorSettingContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click #editBgBtn':'editBgHandler'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.topbarView = new TopBarView();
		this.imModel = IMModel.sharedInstanceIMModel();
	},
	//当模板挂载到元素之后
	afterMount:function(){
		this.profileBg = this.$el.find('#profileBg');
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		if (!user.isLogined()) {
			//把签名清除一次
			store.remove('imSig');
			//跳转走人
		}else{
			this.imModel.fetchIMUserSig(function(sig){
				if (!sig.anchor) {
					
					console.log('跳转走人');
					store.remove('imSig');
					//跳转走人
				}else{
					//继续处理主播
					self.initRender();
				}
			},function(e){
				//处理请求错误
			});	
		}		
	},
	//渲染界面
	initRender:function(){
		console.log('initRender');

		var ProfileView = require('./profile.view');
		new ProfileView();

		var PageContentView = require('./page-content.view');
		new PageContentView();

		var CreateLiveView = require('./create-live.view');
		new CreateLiveView();

	},
	//渲染主播信息
	profileRender:function(){

	},
	//编辑背景
	editBgHandler:function(e){
		console.log(e);
	}
});

module.exports = View;