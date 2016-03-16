/*
	clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';
var dialogTemp = require('./template/fileDialog.html');
var Dialog = require('ui.Dialog');
var Helper = require('./helper');
var UploadFileDialog = function(options){
	var self = this;
	this.options = options;
	if (!options.ready) {
		options.ready = function(){
			self.helper = new Helper();
			self.helper.on('uploadFileSuccess',function(response){
				if (typeof self.options.uploadFileSuccess === 'function') {
					self.options.uploadFileSuccess(response);
				};
			});
			self.helper.on('saveFile',function(){
				if (typeof self.options.saveFile === 'function') {
					self.options.saveFile();
				};
			});
		};
	};
	this.dialog = Dialog.classInstanceDialog(dialogTemp,options);
};
UploadFileDialog.prototype.show = function(){
	this.dialog.show();
};
UploadFileDialog.prototype.hide = function(){
	this.dialog.hide();
};
UploadFileDialog.prototype.emptyValue = function(){
	if (this.helper) {
		this.helper.emptyValue();
	};
};
var shared = null;
UploadFileDialog.sharedInstanceUploadFileDialog = function(options){
	if (!shared) {
		shared = new UploadFileDialog(options);
	}
	return shared;
};
module.exports = UploadFileDialog;