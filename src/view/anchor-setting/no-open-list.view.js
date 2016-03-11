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
var NoOpenPageBoxView = require('./no-open-pagebox.view');
var noOpenModel = NoOpenListModel.sharedInstanceNoOpenListModel();
var View = BaseView.extend({
	el:'#noOpenContent', //设置View对象作用于的根元素，比如id
	events:{ //监听事件

	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.listTemp = require('../../template/anchor-setting/no-open-list.html');
	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		
	}
});

module.exports = View;