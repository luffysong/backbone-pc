/**
 * @time 2016年3月3日
 * @author  icepy
 * @info  跨域AjaxForm
 */

'use strict';

(function(factory) {
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);
	if(typeof exports === 'object' && typeof module === 'object'){
		module.exports = factory();
	}else if(typeof exports === 'object'){
		exports['AjaxForm'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.AjaxForm = factory();
	};
})(function() {
	var uid = 999
	var plugins = window.ICEPlugs || {};
	var url = plugins.url;
	if (!url) {
		url = require('url');
	};
	var AjaxForm = function(options){
		options = options || {};
		this.$el = typeof options.el === 'string' ? $(options.el) : options.el;
		this.uid = 'AjaxForm'+(uid++);
		this._iframeLoadState = false;
		this._success = options.success;
		this._before = options.before;
		this._failure = options.failure;
		this._init();
	};
	AjaxForm.prototype._init = function(){
		this._createIframe();
		this._addEvent();
	};
	AjaxForm.prototype._createIframe = function(){
		var iframeHTML = '<iframe id="'+this.uid+'" name="'+this.uid+'"  style="display: none;" src="about:blank"></iframe>';
		this.$el.attr('target',this.uid);
		this.$el.append(iframeHTML);
		this._iframe = $('#'+this.uid);
		$('<input />').attr({
			type : 'hidden',
			name : 'cross_post',
			value : '1'
		}).appendTo(this.$el);
	};
	AjaxForm.prototype._addEvent = function(){
		var self = this;
		this._iframe.on('load',function(){
			if (self._iframeLoadState) {		
				var cw = this.contentWindow;
				var loc = cw.location;
				if (loc.href === 'about:blank') {
					if (typeof self._failure === 'function') {
						self._failure.call(this);
					};
				}else{
					if (typeof self._success === 'function') {
						try {//如果后台没有作跨域处理，则需手动触发onComplete
							var body = this._iframe[0].contentWindow.document.body;
							innerText = body.innerText;
							if (!innerText) {
								innerText = body.innerHTML;
							};
							if (innerText) {
								self._success.call(this, $.parseJSON(innerText));
							};
						} catch (e) {
							self._success.call(this);
						}
						
					};
				};
				self._iframeLoadState = false;
			};
		});
	};
	AjaxForm.prototype.setIframeState = function(bool){
		this._iframeLoadState = bool;
	};
	AjaxForm.prototype.encrypto = function(secret){
		var self = this;
		$.each(secret, function(key, value) {
			var $item = self.$el.find('[name=' + key + ']');
			if ($item.length === 0) {
				$('<input />').attr({
					type : 'hidden',
					name : key,
					value : value
				}).appendTo(self.$el);
			} else {
				$item.val(value);
			}
		});
	};
	var shared = null;
	AjaxForm.sharedInstanceAjaxForm = function(element,options){
		if (!shared) {
			options = options || {};
			options.el = element;
			shared = new AjaxForm(options);
		}
		return shared;
	};
	AjaxForm.classInstanceAjaxForm = function(element,options){
		options = options || {};
		options.el = element;
		return new AjaxForm(options);
	};
	return AjaxForm;
});