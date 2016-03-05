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
		exports['scrollbar'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.scrollbar = factory();
	};
})(function() {
	var uid = 1000;
	         
	var ScrollbarView = function(options){
		var config = options.config || {};
		this.$el = $(options.el);
		this._floorStyle = config.floor;
		this._topStyle = config.top;
		this._type = options.type || 'y';
		this._init();
	};
	ScrollbarView.prototype._init = function(){
		this._createElement();
		this._initProperty();
		this._createEvent();
	};
	ScrollbarView.prototype._createElement = function(){
		var floorId = 'icepy_floor_y'+(uid++);
		var topId = 'icepy_top_y'+(uid++);
		var scrollbarHTML = '<div id="'+floorId+'"><div id="'+topId+'"></div></div>';
		this.$el.append(scrollbarHTML);
		this._floorDOM = $('#'+floorId);
		this._topDOM = $('#'+topId);
		if (this._floorStyle) {
			this._floorDOM.css(this._floorStyle);
		};
		if (this._topStyle) {
			this._topDOM.css(this._topStyle);
		};
	};
	ScrollbarView.prototype._initProperty = function(){
		this.maxY = this.$el.height();
		this.oneY = this._topDOM.height();
	};
	ScrollbarView.prototype._createEvent = function(){
		// this._topDOM.on('mouseenter',function(e){
		// 	console.log(e);
		// });
		
		//放开
		this._topDOM.on('mouseup',function(e){
			console.log(e);
		});
		//按下
		this._topDOM.on('mousedown',function(e){
			console.log(e);
		});
		//移动
		this._topDOM.on('mousemove',function(e){

		});
	};
	return function(options){
		return new ScrollbarView(options);
	};         
});