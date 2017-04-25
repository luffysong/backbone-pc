/**
 * @time 2016年3月3日
 * @author  icepy
 * @info  跨域模拟Ajax的Form表单
 */

'use strict';

var uniqueId = require('./uniqueId');
var $ = require('jquery');

var AjaxForm = function (options) {
	options = options || {};
  this.$el = typeof options.el === 'string' ? $(options.el) : options.el;
  this.uid = uniqueId('AjaxForm-');
  this.loadState = options.loadState;
  this._init();
};

AjaxForm.prototype._init = function () {
	var defer = $.Deferred();
	$.extend(this,defer.promise());
	this._createIframe();
	this._addEvent(defer);
};

AjaxForm.prototype._createIframe = function(){
	var iframeHTML = '<iframe id="'+this.uid+'" name="'+this.uid+'"  style="display: none;" src="about:blank"></iframe>';
	this.$el.attr('target',this.uid);
	this.$el.append(iframeHTML);
	this._iframe = $('#'+this.uid);
};

AjaxForm.prototype._addEvent = function(promise){
	var self = this;
	this._iframe.on('load',function(){
		if (self.loadState) {
			var cw = this.contentWindow;
			var loc = cw.location;
			if (loc.href === 'about:blank') {
				promise.reject(cw);
			}else{
				try {//如果后台没有作跨域处理，则需手动触发onComplete
					var body = this._iframe[0].contentWindow.document.body;
					innerText = body.innerText;
					if (!innerText) {
						innerText = body.innerHTML;
					};
					if (innerText) {
						promise.resolve($.parseJSON(innerText));
					};
				} catch (e) {
					promise.resolve(this.contentWindow);
				}
			};
			self.loadState = false;
		};
	});
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

module.exports = AjaxForm;
