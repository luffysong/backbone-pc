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
		this.listTemp = require('../../template/anchor-setting/no-open-list.html');
		this.noOpenModel = new NoOpenListModel();
		this.modelParameter = {
			'order':'',
			'offset':0,
			'size':10,
			'access_token':user.getToken()
		};
		this.removeLock = true;
		this.releaseLock = true;
		this.releaseModel = new ReleaseModel();
		this.removeModel = new RemoveModel();
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.noOpenModel.setChangeURL(this.modelParameter);
		this.noOpenModel.execute(function(response){
			console.log(response)
			var data = response.data;
			var roomList = data.roomList;
			var count = Math.ceil(data.totalCount/self.modelParameter.size);
			if (count > 1) {
				self.initPageBox({
					'offset':self.modelParameter.offset+1,
					'size':self.modelParameter.size,
					'count':count
				});
			};
			self.initRender(roomList);
		},function(e){
			
		});
	},
	initPageBox:function(prop){
		this.pageBoxView = new NoOpenPageBoxView({
			props:prop,
			listModel:this.noOpenModel
		});
		this.pageBoxView.on('initRender',this.initRender);
	},
	initRender:function(items){
		var html = this.compileHTML(this.listTemp,{'items':items});
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
						this.releaseModel.setChangeURL({
							roomId:id
						});
						this.releaseModel.execute(function(response){
							this.releaseLock = true;
							span.addClass('disable');
						},function(e){
							self.releaseLock = true;
						});
					}
					break;
				case 3:
					if (this.removeLock) {
						this.removeLock = false;
						//删除
						this.removeModel.setChangeURL({
							roomId:id
						});
						this.removeModel.execute(function(response){
							self.removeLock = true;
							console.log(response);
						},function(e){
							self.removeLock = true;
						});
					};
					break;
			};
		}
	},
	uploadImageHandler:function(e){

	}
});

module.exports = View;