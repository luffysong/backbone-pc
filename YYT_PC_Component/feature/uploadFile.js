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
		exports['uploadFile'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.uploadFile = factory();
	};
})(function() {
	var uid = 999;
	var win = window;
	var url = win.ICEPlugs.url;
	if (!url) {
		url = require('url');
	};
	var tools = win.ICEPlugs.tools;
	if (!tools) {
		tools = require('tools');
	};
	var UploadFile = function(options){
		this.$el = $(options.el);
		this.uid = 'icepy'+(uid++);
		this._data = options.data || data;
		this._filename = options.filename || 'image';
		this._success = options.success;
		this._before = options.before;
		this._failure = options.failure;
		this._iframeLoadState = false;
		this._url = options.url;
		if (!this._url) {
			console.warn('配置上传URL');
			return;
		}
		this.init();
	};
	UploadFile.prototype.init = function(){
		this._createElement();
		this._createIframe();
		this._addEvent();
	};
	UploadFile.prototype._createIframe = function(){
		var iframeHTML = '<iframe id="'+this.uid+'" name="'+this.uid+'"  style="display: none;" src="about:blank"></iframe>';
		this.$el.append(iframeHTML);
		this._iframe = $('#'+this.uid);
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
		inputs += '<input type="file" name="'+this._filename+'" />';
		this.$el.attr('method','POST');
		this.$el.attr('action',this._url);
		this.$el.attr('enctype','multipart/form-data');
		this.$el.attr('target',this.uid);
		this.$el.append(inputs);
	};
	UploadFile.prototype._addEvent = function(){
		var self = this;
		this._iframe.on('load',function(){
			if (self._iframeLoadState) {		
				var cw = this.contentWindow;
				var loc = cw.location;
				if (loc.href === 'about:blank') {
					if (typeof self._failure === 'function') {
						self._failure.call(self);
					};
				}else{
					var search = decodeURIComponent(cw.location.search);
					var query = url.parseSearch(search);
					if (typeof self._success === 'function') {
						self._success.call(self,query);
					};
				};
				self._iframeLoadState = false;
			};
		});
	};
	/**
	 * [submit 提交文件]
	 * @return {[type]} [description]
	 */
	UploadFile.prototype.submit = function(){
		this._iframeLoadState = true;
		if (typeof this._before === 'function' ) {
			this._before();
		};
		this.$el.submit();
	};
	return function(options){
		return new UploadFile(options);
	};
});