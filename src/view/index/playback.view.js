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
var playbackTemp = require('../../template/index/playback.html');
var PlaybackModel = require('../../model/index/playback.model');
var MsgBox = require('ui.MsgBox');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
	el:'#playbackVideo', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		return '';
	},
	events:{ //监听事件

	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.playbackParameter = {
			'deviceinfo': '{"aid":"30001001"}',
			'access_token':user.getToken(),
			'offset':0,
			'size':6
		};
	},
	//当模板挂载到元素之后
	afterMount:function(){
		this.playbackModel = new PlaybackModel();
		this.parentNode = this.$el.parent();
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.playbackModel.executeJSONP(this.playbackParameter,function(response){
			var code = ~~response.code;
			if (code) {
				MsgBox.showError(response.msg);
			}else{
				self.playbackRender(response.data);
			}
		},function(e){

		});
	},
	playbackRender:function(items){
		var le = items.length;
		var u = 0;
		if (le < 3) {
			u = 3;
		}else{
			if (le < 6) {
				u = 6
			}
		}
		while (le < u) {
			le++;
			items.push({
				'completion':1
			})
		}
		var html = this.compileHTML(playbackTemp,{'items':items});
		this.parentNode.css({
			height:590/(6/u)
		});
		this.$el.html(html);
	}
});

module.exports = View;
