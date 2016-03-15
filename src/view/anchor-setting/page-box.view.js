/*
	clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';
var navTemp = 
	'{{each items as item i}}'
		+'<span class="{{if item == num }}now{{/if}}" data-page="{{item}}">{{item}}</span>'
	+'{{/each}}';
var BaseView = require('BaseView'); //View的基类
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	rawLoader:function(){ //可用此方法返回字符串模版

	},
	events:{ //监听事件
		'click .pre':'preHandler',
		'click .next':'nextHandler',
		'click #nav span':'pageboxHandler'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		var props = this._ICEOptions.props;
		this.boxTemp = require('../../template/anchor-setting/pagebox.html');
		this.count = props.count;
		this.offset = props.offset;
		this.size = props.size;
		this.listModel = this._ICEOptions.listModel;
		this.listRender = this._ICEOptions.listRender;
		this.modelParameter = {
			'order':'',
			'offset':0,
			'size':this.size,
			'access_token':user.getToken()
		};
		this.renderData = {
			'count':this.count,
			'omit':this.count > 2,
			'items':[]
		};
		var i = 0;
		for(;i<this.count;i++){
			this.renderData.items.push(i+1);
		};
		
		this.lock = true;
	},
	//当模板挂载到元素之后
	afterMount:function(){
		
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		this.initRender();
	},
	initRender:function(){
		var html = this.compileHTML(this.boxTemp,this.renderData);
		this.$el.html(html);
		this.howPage = this.$el.find('#howPage');
		this.nav = this.$el.find('#nav');
	},
	preHandler:function(e){
		var target = $(e.currentTarget);
		if (this.offset <= 0) {
			return;
		};
		var state = target.attr('data-state');
		this.initRequest(state);
	},
	nextHandler:function(e){
		var target = $(e.currentTarget);
		if (this.offset === this.count - 1) {
			return;
		};
		var state = target.attr('data-state');
		this.initRequest(state);
	},
	pageboxHandler:function(e){
		var el = $(e.currentTarget);
		var page = ~~el.attr('data-page');
		if ((page-1) === this.offset) {
			return;
		};
		var spans = this.nav.find('span');
		spans.removeClass('now');
		el.addClass('now');
		var num = ~~el.text();
		this.offset = num - 1;
		this.openRequest();
	},
	initRequest:function(state){
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
		};
		this.openRequest();
	},
	openRequest:function(){
		var self = this;
		if (this.lock) {
			this.lock = false;
			this.modelParameter.offset = this.offset;
			this.listModel.setChangeURL(this.modelParameter);
			this.listModel.execute(function(response,model){
				self.lock = true;
				self.listRender(response);
			},function(e){
				self.lock = true;
				if (self.offset !== 0) {
					self.offset--;
				};
			});
		}
	},
	resetRender:function(){
		
	}
});
module.exports = View;