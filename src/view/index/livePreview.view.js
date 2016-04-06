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
var livePreviewTemp = require('../../template/index/livePreview.html');
var LivePreviewModel = require('../../model/index/livePreview.model');
var PushLarityModel = require('../../model/index/pushLarity.model');
var MsgBox = require('ui.MsgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	el:'#livePreview', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		return '';
	},
	events:{ //监听事件
		'click .box-praise':'pushLiveVideo'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.livePreviewParameter = {
			'deviceinfo': '{"aid":"30001001"}',
			'access_token':user.getToken(),
			'size':6
		};

		this.pushLarityParameter = {
			'deviceinfo': '{"aid":"30001001"}',
			'access_token':'',
			'type':1,
			'roomId':''
		};
	},
	//当模板挂载到元素之后
	afterMount:function(){
		this.liveModel = new LivePreviewModel();
		this.pushModel = new PushLarityModel();
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.liveModel.executeJSONP(this.livePreviewParameter,function(response){
			var code = ~~response.code;
			if (code) {
				MsgBox.showError(response.msg);
			}else{
				self.livePreRender(response.data);
			}
		},function(e){
			if (e) {
				MsgBox.showError('获取数据错误');
			}
		});
	},
	livePreRender:function(items){
		console.log(items);
		var le = items.length;
		if (le < 6) {
			var temp = items[0];
			while(le < 6){
				le++
				items.push({
					'completion':1
				})
			}
		}
		var html = this.compileHTML(livePreviewTemp,{'items':items});

		this.$el.css()
		this.$el.html(html);
	},
	pushLiveVideo:function(e){
		var el = $(e.currentTarget);
		var roomId = el.attr('data-id');
		var status = el.attr('data-status');

	}
});

module.exports = View;
