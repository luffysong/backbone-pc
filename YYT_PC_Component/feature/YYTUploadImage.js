/**
 * @time 
 * @author 
 * @info 
 */

'use strict';

(function(factory) {
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);
	if(typeof exports === 'object' && typeof module === 'object'){
		module.exports = factory();
	}else if(typeof exports === 'object'){
		exports['YYTUploadImage'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.YYTUploadImage = factory();
		root.ICEPlugs.YYTUploadImageCallback = [];
	};
})(function() {
	var uid = 999;
	var fd = false;
	var win = window;
	if (win.FormData) {
		fd = true;
	};
	var url = win.ICEPlugs.url;
	if (!url) {
		url = require('url');
	}
	var YYTUploadImage = function(options){
		var self = this;
		this.$options = options;
		this.$el = $(options.el);
		this.$instruct = options.instruct || 'iframe';
		if (this.$instruct === 'iframe') {
			if (!options.name) {
				options.name = 'icepy'+(++uid);
			};
			this.$el.attr('method',options.method || 'POST');
			var cmd = '<input type="hidden" name="cmd" value=\''+JSON.stringify(options.data)+' \'/>';
			var iframeUrl = 'http://localhost:4000/';
			var redirect = '<input type="hidden" name="redirect" value="'+iframeUrl+'"/>';
			var file = '<input type="file" name="'+options.filename+'" />';
			var iframeId = 'icepy'+(++uid);
			var iframe = '<iframe id="'+iframeId+'" name="'+options.name+'" style="display: none;" src="about:blank"></iframe>'
			this.$el.attr('action',options.url);
			this.$el.attr('enctype','multipart/form-data');
			this.$el.attr('target',options.name);
			this.$el.append(cmd+redirect+file+iframe);
			this._iframe = $('#'+iframeId);
			this._iframe.on('load',function(){
				var cw = this.contentWindow;
				var search = cw.location.search;
				var query = url.parseSearch(search);
				options.success(query);
			});
		}else{
			if (!fd) {
				console.wran('不支持 FormData');
				return false;
			}
			//处理FormData
			this._ajax = {
				url:options.url,
				type:options.method || 'POST',
				processData:false,
				contentType:false,
				data:new FormData(this.$el[0]),
				success:options.success,
				error:options.error
			};
		}
	};
	YYTUploadImage.prototype.submit = function(){
		if (this.$instruct === 'iframe') {
			this.$el.submit();
		}else{
			if (fd) {
				$.ajax(this._ajax);
			}
		};
	};
	return YYTUploadImage;
});