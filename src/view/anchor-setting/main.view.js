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
var ProfileView = require('./profile.view');
var PageContentView = require('./page-content.view');
var Dialog = require('ui.Dialog');
var UploadFileDialog = require('UploadFileDialog');
var imModel = IMModel.sharedInstanceIMModel();
var user = UserModel.sharedInstanceUserModel();
var MsgBox = require('ui.MsgBox');
var View = BaseView.extend({
	el:'#settingContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click #editBgBtn':'editBgHandler'
	},
	rawLoader:function(){
		return require('../../template/anchor-setting/setting-body.html')
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.topbarView = new TopBarView();
		this.isLogined = false;
		this.upload = null;
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
			this.topbarView.on('logined',function(){
				self.fetchIMUserSig();
			});
			//跳转走人
		}else{
			this.fetchIMUserSig();
		}
	},
	//渲染界面
	initRender:function(){
		var self = this;
		var fileOptions = {
			width : 580,
			height : 341,
			isRemoveAfterHide : false,
			isAutoShow : false,
			mainClass:'shadow_screen_x',
			closeClass:'editor_bg_close_x',
			closeText:'X',
			title:'背景设置',
			ctrlData:{
				"cmd":[
					{"saveOriginal" : 1, "op" : "save", "plan" : "avatar", "belongId" :"20634338","srcImg":"img"}
				],
				"redirect":window.location.origin+"/web/upload.htm"
			},
			uploadFileSuccess:function(response){
				//上传成功

			},
			saveFile:function(){
				//保存
			}
		};
		this.upload = new UploadFileDialog(fileOptions);
		this.isLogined = true;
		this.profileView = new ProfileView();
		this.pageContentView = new PageContentView();
	},
	fetchIMUserSig:function(){
		var self = this;
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
			MsgBox.showError('获取签名错误');
		});
	},
	editBgHandler:function(e){
		if (this.isLogined) {
			if(this.upload){
				this.upload.emptyValue();
			};
			this.upload.show();
		}else{
			MsgBox.showError('未登录或获取签名失败');
		};
	},
	uploadSuccess:function(response){
		var images = response.images;
		var path = images[0].path;
	},
	saveFileSuccess:function(){
		//保存
	}
});

module.exports = View;
