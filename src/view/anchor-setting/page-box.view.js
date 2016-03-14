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
var View = BaseView.extend({
	el:'#pageboxContains', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		var template = require('../../template/anchor-setting/pagebox.html');
		return template; 
	},
	events:{ //监听事件
		'click .pre':'preHandler',
		'click .next':'nextHandler',
		'click #pageboxContains a':'pageboxHandler'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		var props = this._ICEOptions.props;
		this.count = props.count;
		this.offset = props.offset;
		this.size = props.size;
		this.listModel = this._ICEOptions.listModel;
		this.modelParameter = {
			'order':'',
			'offset':0,
			'size':this.size,
			'access_token':user.getToken()
		};
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		
	},
	initRender:function(){

	},
	preHandler:function(e){
		var target = $(e.currentTarget);
		var _class = target.attr('class');
		if (_class.indexOf('am-disabled') > -1) {
			return;
		};
		var state = target.attr('data-state');
		this.listRequest(state);
	},
	nextHandler:function(e){

	},
	pageboxHandler:function(e){

	},
	initRequest:function(state){
		var self = this;
		switch(state){
			case '1':
				if (this.offset !== 0) {
					this.offset--;
				};
				break;
			case '2':
				if (this.offset <= this.count - 2) {
					this.offset++;
				};

				break;
			default:

				break;
		};
		this.modelParameter.offset = this.offset;
		this.listModel.setChangeURL(this.modelParameter);
		this.listModel.execute(function(response,model){
			var data = response.data;
			
		},function(e){
			if (self.offset !== 0) {
				self.offset--;
			};
		});
	}
});
module.exports = View;