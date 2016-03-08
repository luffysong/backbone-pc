/**
 * @time 2012年10月19日
 * @author icepy
 * @info 完成基础的View类
 *
 * @time 2016年2月27日
 * @author icepy
 * @info 改造兼容webpack打包
 */

'use strict';

var _win = window;
var Backbone = _win.Backbone
if (!Backbone) {
	throw new Error("import Backbone");
};
var tplEng = require('../link/template');
var warn = require('./util/warn');
var tools = require('./util/tools')
var BaseView = Backbone.View.extend({
	initialize:function(options){	
		//默认开启客户端渲染模式
		if (this.clientRender === undefined && this.clientRender !== false) {
			this.clientRender = true;
		};
		this._ICEOptions = options || {};
		if (this.beforeMount && typeof this.beforeMount === 'function') {
			this.beforeMount();
		}else{
			warn('你应该创建beforeMount钩子方法，在此方法中获取DOM元素，并初始化一些自定义的属性')
		};
		this._ICEinit();
		return this;
	},
	_ICEinit:function(){
		var self = this;
		if (this.clientRender) {
			if (typeof this.rawLoader === 'function') {
				self._template = this.rawLoader();
				self.$el.append(self._template);
				self._ICEAfterMount();
				self._ICEObject();
				
			}else{
				warn('使用templateUrl设置模板文件URL或者使用rawLoader方法返回一个模板字符串，如果你的页面是服务端渲染HTML，可将clientRender设置为false');
			}
		}else{
			self._ICEAfterMount();
			self._ICEObject();
		};
	},
	_ICEAfterMount:function(){
		if (typeof this.afterMount === 'function') {
			this.afterMount();
		}else{
			warn('你应该创建afterMount钩子方法')
		};
	},
	_ICEObject:function(){
		if (this.clientRender) {
			this._ICEinitEvent();
		};
		this._ICEinitNode();
		this._store = {};
		this.__YYTPC__ = true;
		if (typeof this.ready === 'function') {
			this.ready();
		};
	},
	_ICEinitEvent:function(){
		this.delegateEvents(this.events);
	},
	_ICEinitNode:function(){
		this.$parent = this._ICEOptions.parent;
		this.$children  = [];
		this.$root = this.$parent ? this.$parent.$root : this;
		if (this.$parent) {
			this.$parent.$children.push(this);
		};
	},
	/**
	 * [compileHTML 编译模板]
	 * @param  {[type]} tplStr [description]
	 * @param  {[type]} data   [description]
	 * @return {[type]}        [description]
	 */
	compileHTML:function(tplStr,data){
		return tplEng.compile(tplStr)(data);
	},
	/**
	 * [broadcast 触发所有子对象的事件]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	broadcast:function(event){
		var isString = typeof event === 'string';
		event = isString ? event : event.name;
		var p = tools.toArray(arguments,1);
		var children = this.$children;
		var i = 0;
		var j = children.length;
		for(;i<j;i++){
			var child = children[i];
			child.trigger.apply(child,p);
			child.broadcast.apply(child,p);
		}
		return this;
	},
	/**
	 * [dispatch 触发所有父对象的事件]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	dispatch:function(event){
		var isString = typeof event === 'string';
		event = isString ? event : event.name;
		var p = tools.toArray(arguments,1);
		var parent = this.$parent;
		while(parent){
			parent.trigger.apply(parent,p);
			parent = parent.$parent;
		}
	}
}); 

module.exports = BaseView;