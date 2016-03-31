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
var NoticeGetModel = require('../../model/anchor/notice-get.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var View = BaseView.extend({
	el:'#userInfoWrap', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		return require('../../template/live-room/anchor-card.html');
	},
	events:{ //监听事件

	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.elements = {};
	},
	//当模板挂载到元素之后
	afterMount:function(){
		var el = this.$el;
		this.noticeGetModel = new NoticeGetModel();

		this.tagTpl = this.$el.find('#tagTpl').html();

		this.elements = {
			anchorAvatar: el.find('#anchorAvatar'),
			name: el.find('#anchorName'),
			btnAdd: el.find('#btnAdd'),
			btnReport: el.find('#btnReport'),
			tagsWrap: el.find('#tagsWrap'),
			noticeWrap: el.find('#noticWrap')
		};

		this.noticeGetParams = {
			deviceinfo: '{"aid":"30001001"}',
			roomId: '',
			access_token: 'web-' + user.getToken()
		};

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){

		this.defineEventInterface();
	},
	defineEventInterface: function () {
		var self = this;
		Backbone.on('event:roomInfoReady', function (data) {
			if (data) {
				self.roomInfo = data;
				self.bindData(data);
				self.getNoticeInfo();
			}
		});
		Backbone.on('event:updateRoomInfo', function (data) {
			if (data) {

			}
		});
	},
	bindData: function(data){
		var els = this.elements;

		els.anchorAvatar.attr('src', data.creator.largeAvatar);
		els.name.text(data.creator.nickName);

		var template = _.template(this.tagTpl);
		els.tagsWrap.html(template(data.creator));
	},
	getNoticeInfo: function () {
		var self = this;
		this.noticeGetParams.roomId = this.roomInfo.id;

		this.noticeGetModel.executeJSONP(this.noticeGetParams, function (res) {
			if (res && res.data) {
				console.log(self.elements.noticeWrap);
				var notice = null;
				res.data.placards && (notice = res.data.placards[0]);
				if (notice) {
					self.elements.noticeWrap.text(notice.content || '暂无公告');
				} else {
					self.elements.noticeWrap.text('暂无公告');
				}
			}
		}, function (err) {
			msgBox.showError(err.msg || '获取公告失败');
		});
	}

});

module.exports = View;