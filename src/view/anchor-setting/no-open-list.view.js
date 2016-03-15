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
var NoOpenListModel = require('../../model/anchor-setting/no-open-list.model');
var ReleaseModel = require('../../model/anchor-setting/release-video.model');
var RemoveModel = require('../../model/anchor-setting/remove-video.model');
var NoOpenPageBoxView = require('./page-box.view');
var MsgBox = require('ui.MsgBox');
var Confirm = require('ui.Confirm');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	el:'#noOpenContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click li':'checkLiveVideoHandler',
		'click .uploadImage':'uploadImageHandler'
	},
	rawLoader:function(){

	},
	//当模板挂载到元素之前
	beforeMount:function(){
		var token = user.getToken();
		this.listTemp = require('../../template/anchor-setting/no-open-list.html');
		this.noOpenParameter = {
			'deviceinfo':'{"aid":"30001001"}',
			'order':'',
			'offset':0,
			'size':6,
			'access_token':token
		};
		this.removeParameter = {
			'deviceinfo':'{"aid":"30001001"}',
			'roomId':'',
			'access_token':token
		};
		this.releaseParameter = {
			'deviceinfo':'{"aid":"30001001"}',
			'roomId':'',
			'access_token':token
		};
		this.removeLock = true;
		this.releaseLock = true;
		this.noOpenModel = new NoOpenListModel();
		this.releaseModel = new ReleaseModel();
		this.removeModel = new RemoveModel();
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.noOpenModel.setChangeURL(this.noOpenParameter);
		this.noOpenModel.execute(function(response){
			var data = response.data;
			var roomList = data.roomList;
			var count = Math.ceil(data.totalCount/self.noOpenParameter.size);
			if (count > 1) {
				self.initPageBox({
					'offset':self.noOpenParameter.offset,
					'size':self.noOpenParameter.size,
					'count':count
				});
			};
			self.initRender(roomList);
		},function(e){
			
		});
	},
	initPageBox:function(prop){
		var self = this;
		this.pageBoxView = new NoOpenPageBoxView({
			id:'#noOpenPageBox',
			props:prop,
			listModel:this.noOpenModel,
			listRender:function(response){
				var data = response.data;
				var roomList = data.roomList;
				self.initRender(roomList);
			}
		});
	},
	initRender:function(items){
		var html = '';
		if (items.length) {
			html = this.compileHTML(this.listTemp,{'items':items});
		}else{
			html = '<h1>暂无数据</h1>';
		};
		this.$el.html(html);
	},
	checkLiveVideoHandler:function(e){
		var self = this;
		var el = $(e.currentTarget);
		var span = $(e.target);
		var state = span.data('state');
		var id = el.attr('data-id');
		if (state) {
			switch(state){
				case 2:
					//发布
					if (span.attr('class') === 'disable') {
						return;
					};
					if (this.releaseLock) {
						this.releaseLock = false;
						this.removeParameter.roomId = id;
						this.releaseModel.setChangeURL(this.removeParameter);
						this.releaseModel.execute(function(response){
							this.releaseLock = true;
							span.addClass('disable');
						},function(e){
							self.releaseLock = true;
							MsgBox.showError('发布失败');
						});
					}
					break;
				case 3:
					if (this.removeLock) {
						Confirm.show({
							content:'是否确认删除',
							okFn:function(){
								self.removeLock = false;
								self.removeParameter.roomId = id;
								self.removeModel.setChangeURL(self.removeParameter);
								self.removeModel.execute(function(response){
									self.removeLock = true;
									console.log(response);
								},function(e){
									self.removeLock = true;
									MsgBox.showError('删除失败');
								});
							}
						})
						
					};
					break;
			};
		}
	},
	uploadImageHandler:function(e){

	}
});
module.exports = View;