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
var LoginUserView = require('LoginUser');
var IndexModel = require('../model/index.model');
var View = BaseView.extend({
	clientRender:false,
	el:'#topBar', //设置View对象作用于的根元素，比如id
	events:{ //监听事件
		'click .show-drop-menu': 'showDropMenu'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.indexModel = new IndexModel();
		this.loginUserView = new LoginUserView()
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		this.showDropMenuEle = $('.PcMsg .pcNav');
		this.hideDropMenu();
	},
	/**
	 * 显示下拉菜单
	 */
	showDropMenu: function (e) {
		e.preventDefault();
		console.log(123);
		this.showDropMenuEle.toggle();
		return false;
	},
	/**
	 * 隐藏下拉菜单
	 */
	hideDropMenu: function () {
		var self = this;
		$(document).on('click', function () {
			self.showDropMenuEle.hide();
		});
	}
});

module.exports = View;