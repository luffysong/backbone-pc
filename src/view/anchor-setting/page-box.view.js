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
		+'<span class="{{if item == num }}now{{/if}}" data-page="{{item}}" data-indice="{{i}}">{{item}}</span>'
	+'{{/each}}';
var BaseView = require('BaseView'); //View的基类
var UserModel = require('UserModel');
var MsgBox = require('ui.MsgBox');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	clientRender:false,
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
		this.sectionBase = props.sectionBase || 3;
		this.listModel = this._ICEOptions.listModel;
		this.listRender = this._ICEOptions.listRender;
		this.modelParameter = {
			'deviceinfo':'{"aid":"30001001"}',
			'order':'',
			'offset':0,
			'size':this.size,
			'access_token':'web-'+user.getToken()
		};
		this.omit = this.count > 2;
		this.items = [];
		var i = 0;
		for(;i<this.count;i++){
			this.items.push(i+1);
		};
		this.lock = true;
		this.translation = 0;
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		this._ICEinitEvent();
		this.initRender();
	},
	initRender:function(){
		var temp = this.items.concat();
		if (this.omit) {
			temp = temp.splice(0,3);
		}
		var data = {
			'count':this.count,
			'omit':this.omit,
			'items':temp
		};
		var html = this.compileHTML(this.boxTemp,data);
		this.$el.html(html);
		this.howPage = this.$el.find('#howPage');
		this.nav = this.$el.find('#nav');
	},
	preHandler:function(e){
		var target = $(e.currentTarget);
		if (this.offset <= 0) {
			MsgBox.showTip('原因：已经翻到最前一页');
			return;
		};
		var state = target.attr('data-state');
		this.initRequest(state);
	},
	nextHandler:function(e){
		var target = $(e.currentTarget);
		if (this.offset === this.count - 1) {
			MsgBox.showTip('原因：已经翻到最后一页');
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
		this.translation = ~~el.attr('data-indice');
		this.openRequest();
	},
	initRequest:function(state){
		switch(state){
			case '1':
				if (this.offset !== 0) {
					this.offset--;
					this.sectionLogic(0);
				};
				break;
			case '2':
				if (this.offset <= (this.count - 2)) {
					this.offset++;
					this.sectionLogic(1);
				};
				break;
		};
		this.openRequest();
	},
	openRequest:function(){
		var self = this;
		if (this.lock) {
			this.lock = false;
			this.modelParameter.offset = (this.offset || 0) * this.size;
			this.listModel.executeJSONP(this.modelParameter,function(response,model){
				self.lock = true;
				var code = ~~response.code;
				if (code) {
					MsgBox.showError(response.msg);
					return;
				};
				self.listRender(response);
			},function(e){
				self.lock = true;
				if (self.offset !== 0) {
					self.offset--;
				};
			});
		}
	},
	sectionLogic:function(state){
		var base = this.sectionBase - 1;
		var boundary = this.offset + (base);
		var temp = this.items.concat();
		var middle = temp[boundary];
		if (middle <= temp[temp.length - 1] ) {
			this.translation = 0;
			temp = temp.splice(this.offset,this.sectionBase);
			this.sectionRender(temp,temp[0]);
		}else{
			if (!middle) {
				//如果中间值未存在
				var start = this.offset ? this.offset - 1 : this.offset; //重新计算起始位置
				if (this.offset > (this.count - 2)) {
					//已经到最后一位了
					if(start){
						--start;
					}
				}
				var middleTemp = temp.splice(start,this.sectionBase);
				this.translation = 0;
				//并且迁移一位
				this.sectionRender(middleTemp,this.offset+1);
				return;
			}
			if (this.translation > base) {
				return;
			};
			if (state) {
				//true ++
				this.translation++;
			}else{
				//false --
				this.translation--;
			};
			this.spans.removeClass('now');
			var span = this.spans[this.translation];
			$(span).addClass('now');
		};
	},
	sectionRender:function(items,state){
		var html = this.compileHTML(navTemp,{'items':items,'num':state});
		this.nav.html(html);
		this.spans = this.nav.find('span');
	}
});
module.exports = View;
