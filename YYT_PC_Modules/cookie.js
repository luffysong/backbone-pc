/**
 * @time 2012年10月26日
 * @author icepy
 * @info 完成cookie模块
 */

'use strict';

(function(factory) {
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);
	if(typeof exports === 'object' && typeof module === 'object'){
		module.exports = factory();
	}else if(typeof exports === 'object'){
		exports['cookie'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.cookie = factory();
	};
})(function() {
	return {
		/**
		 * [get 获取cookie]
		 * @param  {[String]} name [description]
		 */
		get: function(name) {
			var cookieName = encodeURIComponent(name) + '=';
			var cookieStart = document.cookie.indexOf(cookieName);
			var cookieValue = null;
			var cookieEnd;
			if (cookieStart > -1) {
				cookieEnd = document.cookie.indexOf(';', cookieStart);
				if (cookieEnd == -1) {
					cookieEnd = document.cookie.length;
				}
				cookieValue = decodeURIComponent(document.cookie.substring(cookieStart +
					cookieName.length, cookieEnd));
			}
			return cookieValue;
		},
		/**
		 * [set 设置cookie]
		 * @param {[type]} name    [description]
		 * @param {[type]} value   [description]
		 * @param {[type]} expires [description]
		 * @param {[type]} path    [description]
		 * @param {[type]} domain  [description]
		 * @param {[type]} secure  [description]
		 */
		set: function(name, value, expires, path, domain, secure) {
			var cookieText = encodeURIComponent(name) + '=' +
				encodeURIComponent(value);
			if (expires instanceof Date) {
				cookieText += '; expires=' + expires.toUTCString();
			}
			if (path) {
				cookieText += '; path=' + path;
			}
			if (domain) {
				cookieText += '; domain=' + domain;
			}
			if (secure) {
				cookieText += '; secure';
			}
			document.cookie = cookieText;
		},
		/**
		 * [unset 删除cookie]
		 * @param  {[type]} name   [description]
		 * @param  {[type]} path   [description]
		 * @param  {[type]} domain [description]
		 * @param  {[type]} secure [description]
		 */
		unset: function(name, path, domain, secure) {
			this.set(name, '', new Date(0), path, domain, secure);
		},
		version: '0.0.1'
	};
});