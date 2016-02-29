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
	var YYTUploadImage = function(options){
		this.$options = options;
		this.$el = $(options.el);
		this.$el.attr('method',options.method || 'POST');
		this.$el.attr('action',options.url);
		this.$el.attr('enctype','multipart/form-data');
		if (window.FormData) {
			this._fd = true;
			this._ajax = {
				url:options.url,
				type:options.method || 'POST',
				processData:false,
				contentType:false
			};
		};
		if (this._fd) {
			this._ajax.data = new FormData(this.$el[0]);
			this._ajax.success = options.success;
			this._ajax.error = options.error; 
		}else{
			if (!options.name) {
				options.name = 'icepy'+(++uid);
			};
			this.$el.attr('target',options.name);
			var iframeId = 'icepy'+(++uid);
			var iframe = '<iframe id="'+iframeId+'" name="'+options.name+'" style="display: none;"></iframe>'
			this.$el.append(iframe);
			this._iframe = $('#'+iframeId);
		};
	};
	YYTUploadImage.prototype.start = function(){
		if (this._fd) {
			$.ajax(this._ajax);
		}else{
			this._iframe.submit();
		}
	};
	return YYTUploadImage;
});