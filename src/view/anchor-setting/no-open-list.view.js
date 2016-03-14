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
var NoOpenPageBoxView = require('./page-box.view');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	clientRender:false,
	el:'#noOpenContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click #noOpenContent li':'noOpenListHandler'
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
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		console.log(this);
		this.noOpenModel.setChangeURL(this.modelParameter);
		this.noOpenModel.execute(function(response){
			var data = response.data;
			var count = Math.ceil(data.totalCount/self.modelParameter.size);
			if (count > 1) {
				self.initPageBox({
					'offset':self.modelParameter.offset+1,
					'size':self.modelParameter.size,
					'count':count
				});
			};
		},function(e){

		});
	},
	initPageBox:function(prop){
		this.pageBoxView = new NoOpenPageBoxView({
			props:prop,
			listModel:this.noOpenModel
		});
	},
	noOpenListHandler:function(e){
		var el = $(e.currentTarget);
		console.log(el);
	}
});

module.exports = View;