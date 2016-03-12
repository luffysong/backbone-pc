/**
 *
 * @time 2016年2月27日
 * @author icepy
 * @info 完成date
 */

'use strict';

(function(factory) {
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);
	if(typeof exports === 'object' && typeof module === 'object'){
		module.exports = factory();
	}else if(typeof exports === 'object'){
		exports['DateTime'] = factory()
	}else{
		if (!root.ICEPlugs) {
			root.ICEPlugs = {};
		};
		root.ICEPlugs.DateTime = factory();
	};
})(function() {
				
	var DateTime = function(){
		this.temp = new Date();
		this.date = new Date();
		this.attrs = {
			'year':this.date.getFullYear(),
			'month':this.date.getMonth() + 1,
			'day':this.date.getDate(),
			'hours':this.date.getHours(),
			'minutes':this.date.getMinutes()
		};
		this.temp.setMonth(this.attrs.month);
		this.temp.setDate(0);
	};
	DateTime.prototype.getCountDays = function(value){

		return this.temp.getDate();
	};
	DateTime.prototype.$get = function(key){
		return this.attrs[key];
	};
	DateTime.prototype.ceilYear = function(value){
		value = ~~value;
		var i = 0;
		var year = this.$get('year');
		var result = [];
		for(;i<=value;i++){
			result.push(year);
			year = year+1;
		}
		return result;
	};
	DateTime.prototype._downDisplacement = function(key){
		var start = this.$get(key);
		var result = [];
		var end;
		switch(key){
			case 'month':
				end = 12;
				break;
			case 'day':
				end = this.getCountDays();
				break;
			case 'hours':
				end = 23;
				break;
			default:
				end = 59;
				break;
		}
		for(;start<=end;start++){
			result.push(start);
		}
		return result;
	};
	DateTime.prototype.downMonth = function(){
		return this._downDisplacement('month');
	};
	DateTime.prototype.downDay = function(){
		return this._downDisplacement('day');
	};
	DateTime.prototype.downHours = function(){
		return this._downDisplacement('hours');
	};
	DateTime.prototype.downMinutes = function(){
		return this._downDisplacement('minutes');
	};
	DateTime.prototype.getTime = function(obj){
		var val = '';
		var month = obj.month < 10 ? '0'+obj.month : obj.month;
		var day = obj.day < 10 ? '0'+obj.day : obj.day;
		var hours = obj.hours < 10 ? '0'+obj.hours : obj.hours;
		var minutes = obj.minutes < 10 ? '0'+obj.minutes : obj.minutes;
		val += obj.year+'-'+month+ '-'+day+' ';
		val += hours+':'+minutes+ ':00';
		return new Date(val.replace(/-/g, '/')).getTime();
	};
	var shared = null;
	DateTime.sharedInstanceDateTime = function(){
		if (!shared) {
			shared = new DateTime();
		}
		return shared;
	};
	return DateTime;
});