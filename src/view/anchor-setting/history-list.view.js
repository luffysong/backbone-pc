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
var HistoryListModel = require('../../model/anchor-setting/history-list.model');
var NoOpenPageBoxView = require('./page-box.view');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	el:'#historyContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件

	},
	rawLoader:function(){},
	//当模板挂载到元素之前
	beforeMount:function(){
		var token = user.getToken();
		this.listTemp = require('../../template/anchor-setting/history-list.html');
		this.historyParameter = {
			'deviceinfo':'{"aid":"30001001"}',
			'order':'',
			'offset':0,
			'size':6,
			'access_token':token
		};
		this.historyModel = new HistoryListModel();
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.historyModel.setChangeURL(this.historyParameter);
		this.historyModel.execute(function(response){
			var data = response.data;
			var roomList = data.roomList;
			var count = Math.ceil(data.totalCount/self.historyParameter.size);
			if (count > 1) {
				self.initPageBox({
					'offset':self.historyParameter.offset+1,
					'size':self.historyParameter.size,
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
			id:'#historyPageBox',
			props:prop,
			listModel:this.endModel,
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
	}
});

module.exports = View;