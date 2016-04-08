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
var recommendTemp = require('../../template/index/recommend.html');
var RecommendModel = require('../../model/index/recommended.model');
var MsgBox = require('ui.MsgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var FlashAPI = require('FlashAPI');
var View = BaseView.extend({
	el:'#topContainer', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		return '';
	},
	events:{ //监听事件
		'click .go-livehome':'gotoLiveHome'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.recommendParameter = {
			'deviceinfo': '{"aid":"30001001"}',
			'access_token':user.getToken()
		};
	},
	//当模板挂载到元素之后
	afterMount:function(){
		this.recommendModel = new RecommendModel();
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;

		this.recommendModel.executeJSONP(this.recommendParameter,function(response){
			var code = ~~response.code;
			if (code) {

			}else{
				self.recommendRender(response.data[0]);
			}
		},function(e){
			if (e) {
				MsgBox.showError('获取数据错误');
			}
		});
	},
	recommendRender:function(data){
		var status = data.status;
		var html = this.compileHTML(recommendTemp,{data:data});
		this.$el.html(html);
		if (status === 3 || status === 2) {
			this.flashAPI = FlashAPI.sharedInstanceFlashAPI({
	            el: 'topFlash',
				props:{
					width: 1014,
					height: 570
				}
	        });
		}
		if (this.flashAPI) {
			this.flashAPI.onReady(function(){
				data.isIndex = true;
				this.init(data);
			});
		}
	},
	gotoLiveHome:function(e){
		var el = $(e.currentTarget);
		var id = el.attr('data-id');
		var status = ~~(el.attr('data-status'));
		switch (status) {
			case 2:
				//处理直播
				window.location.href = '/web/liveRoom.html?roomId='+id;
				break;
			case 3:
				//处理回放
				window.location.href= '/web/playback.html?roomId='+id;
				break;
			default:
				//默认不处理

		}
	}
});

module.exports = View;
