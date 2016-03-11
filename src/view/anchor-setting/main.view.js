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
var TopBarView = require('../topbar/topbar.view');
var IMModel = require('../../lib/IMModel');
var store = require('store');
var SettingBgView = require('./edit-bg.view');
var ProfileView = require('./profile.view');
var imModel = IMModel.sharedInstanceIMModel();
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	el:'#settingContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件

	},
	rawLoader:function(){
		return require('../../template/anchor-setting/setting-body.html')
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.topbarView = new TopBarView();
	},
	//当模板挂载到元素之后
	afterMount:function(){
		
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		if (!user.isLogined()) {
			//把签名清除一次
			store.remove('imSig');
			//跳转走人
		}else{
			imModel.fetchIMUserSig(function(sig){
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
		this.settingBgView = new SettingBgView();
		this.profileView = new ProfileView();

		var PageContentView = require('./page-content.view');
		new PageContentView();

		var CreateLiveView = require('./create-live.view');
		new CreateLiveView();

	}
});

module.exports = View;