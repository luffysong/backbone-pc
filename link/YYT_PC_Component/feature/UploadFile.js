/**
 * @time 2016年3月3日
 * @author  icepy
 * @info  跨域上传图片，只支持iframe的方式
 */

'use strict';

(function(factory) {
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);
	if(typeof exports === 'object' && typeof module === 'object'){
		module.exports = factory();
	}else if(typeof exports === 'object'){
		exports['UploadFile'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.UploadFile = factory();
	};
})(function() {
	var uid = 999;
	var win = window;
	var ICEPlugs = win.ICEPlugs || {};
	var url = ICEPlugs.url;
	if (!url) {
		url = require('url');
	};
	var tools = ICEPlugs.tools;
	if (!tools) {
		tools = require('tools');
	};
	var AjaxForm = ICEPlugs.AjaxForm;
	if (!AjaxForm) {
		AjaxForm = require('AjaxForm');
	};
	var shared = null;
	var UploadFile = function(options){
		var self = this;
		this.$el = typeof options.el === 'string' ? $(options.el) : options.el;
		this.uid = 'UploadFile'+(uid++);
		this.options = options;
		this._data = options.data || {};
		this._filename = options.filename || 'image';
		this._success = options.success;
		this._before = options.before;
		this._failure = options.failure;
		this._url = options.url;
		if (!this._url) {
			console.warn('配置上传URL');
			return;
		};
		this._init();
		this.ajaxForm = AjaxForm.classInstanceAjaxForm(this.$el,{
			type:'img',
			success:function(){
				var cw = this.contentWindow;
				var loc = cw.location;
				var search = decodeURIComponent(cw.location.search);
				var query = url.parseSearch(search);
				if (typeof self._success === 'function') {
					self._success.call(this,query);
				};
			},
			failure:function(){
				//错误处理
				if (typeof self._failure  === 'function') {
					self._failure.call(this);
				};
			}
		});
	};
	UploadFile.prototype._init = function(){
		this._createElement();
	};
	UploadFile.prototype._createElement = function(){
		var inputs = '';
		for(var name in this._data){
			var value = this._data[name];
			var type = tools.toType(value);
			if (type === '[object Object]' || type === '[object Array]') {
				value = JSON.stringify(value);
			};
			inputs += '<input type="hidden" name="'+name+'" value=\''+value+'\'/>';
		};
		inputs += '<input type="file" class="upload-file '+this.options.className+'" name="'+this._filename+'"  />';
		this.$el.attr('method','POST');
		this.$el.attr('action',this._url);
		this.$el.attr('enctype','multipart/form-data');
		this.$el.append(inputs);
	};
	/**
	 * [submit 提交文件]
	 * @return {[type]} [description]
	 */
	UploadFile.prototype.submit = function(){
		this.ajaxForm.setIframeState(true);
		if (typeof this._before === 'function' ) {
			this._before();
		};
		this.$el.submit();
	};
	UploadFile.sharedInstanceUploadFile = function(options){
		if (!shared) {
			shared = new UploadFile(options);
		}
		return shared;
	};
	UploadFile.classInstanceUploadFile = function(options){
		return new UploadFile(options);
	};
	//错误码消息映射
	UploadFile.prototype.parseErrorMsg = function(res){
		if(res && res.state == 'SUCCESS'){
			return true;
		}
		var code = res.errCode *1 || 0;
		switch(code){
			case 29:
				return '上传的文件太大了,请重新上传';
			case 31:
				return '请上传JPGE,JPG,PNG,GIF等格式的图片文件';
		}

		return '文件上传失败,请重新上传';
	};
	return UploadFile;
});
