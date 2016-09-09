/**
 * @time 2016年3月3日
 * @author  icepy
 * @info  跨域上传图片，只支持iframe的方式
 */

'use strict';

var url = require('./url');
var AjaxForm = require('./AjaxForm');
var uniqueId = require('./uniqueId');
var $ = require('jquery');

var UploadFile = function (options) {
  // var self = this;
  this.$el = typeof options.el === 'string' ? $(options.el) : options.el;
  this.uid = uniqueId('UploadFile-');
  this.options = options;
  this._data = options.data || {};
  this.nofile = options.nofile || false;
  this._filename = options.filename || 'image';
  this._url = options.url;
  if (!this._url) {
	   console.warn('配置上传URL');
    return;
  }
  this._init();
};

UploadFile.prototype._init = function () {
  var defer = $.Deferred();
  this.defer = defer;
  $.extend(this, defer.promise());
  this._createElement();
};

UploadFile.prototype._createElement = function () {
	var inputs = '';
	for(var name in this._data){
		var value = this._data[name];
		var type = Object.prototype.toString.call(value);
		if (type === '[object Object]' || type === '[object Array]') {
			value = JSON.stringify(value);
		};
		inputs += '<input type="hidden" name="'+name+'" value=\''+value+'\'/>';
	};
	if(this.nofile){
	}else{
		inputs += '<input type="file" class="opacity0 upload-file '+this.options.className+'" name="'+this._filename+'"  />';
	}
	this.$el.attr('method','POST');
	this.$el.attr('action',this._url);
	this.$el.attr('enctype','multipart/form-data');
	this.$el.append(inputs);
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

/**
 * [submit 提交文件]
 * @return {[type]} [description]
 */
UploadFile.prototype.submit = function () {
  // var self  = this;
  if (typeof this._before === 'function') {
	    this._before();
  }
  var defer = this.defer;
  this.ajaxForm = AjaxForm.classInstanceAjaxForm(this.$el, {
	  type:'img',
    loadState: true
	});
	this.ajaxForm.done(function(cw){
		var loc = cw.location;
		var search = decodeURIComponent(loc.search);
		var query = url.parseSearch(search);
		defer.resolve(query);
	});
	this.ajaxForm.fail(function(){
		defer.reject(this);
	});
	this.$el.submit();
	return defer.promise();
};

var shared = null;
UploadFile.sharedInstanceUploadFile = function(options){
	if (!shared) {
		shared = new UploadFile(options);
	}
	return shared;
};
UploadFile.classInstanceUploadFile = function(options){
	return new UploadFile(options);
};

module.exports = UploadFile;
