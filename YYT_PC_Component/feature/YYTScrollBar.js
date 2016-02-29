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
		exports['YYTScrollBar'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.YYTScrollBar = factory();
	};
})(function() {
	var uid = 999;
	         

	         
});