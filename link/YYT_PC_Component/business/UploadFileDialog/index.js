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
var FileDialog = require('./template/fileDialog.html');
var Dialog =require('ui.Dialog');
var View = BaseView.extend({
	clientRender:false,
	events:{ //监听事件

	},
	//当模板挂载到元素之前
	beforeMount:function(){

	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(options){
		this.dialog = Dialog.classInstanceDialog(FileDialog,options);
		console.log(this.dialog)
	},
	show:function(){
		this.dialog.show();
	},
	hide:function(){
		this.dialog.hide();
	}
});

var shared = null;
View.sharedInstanceUploadFileDialog = function(options){
	if (!shared) {
		shared = new View(options);
	}
	return shared;
};

module.exports = View;