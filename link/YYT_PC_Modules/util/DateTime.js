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
				
	var DateTime = function(long){
		this.temp = new Date();
		this.setCurNewDate(long);
	};
	/**
	 * [changeYear 改变临时年份]
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	DateTime.prototype.changeYear = function(value){
		this.temp.setFullYear(value);
	}; 
	/**
	 * [getCountDays 根据月份获取当前月的总天数]
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	DateTime.prototype.getCountDays = function(value){
		this.temp.setMonth(value);
		this.temp.setDate(0);
		return this.temp.getDate();
	};
	/**
	 * [$get 获取当前的年月日时分]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	DateTime.prototype.$get = function(key){
		return this.attrs[key];
	};
	/**
	 * [ceilYear 向下获取年份]
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
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
				end = this.getCountDays(this.$get('month'));
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
	/**
	 * [downMonth 向下获取月份]
	 * @return {[type]} [description]
	 */
	DateTime.prototype.downMonth = function(){
		return this._downDisplacement('month');
	};
	/**
	 * [downDay 向下获取天数]
	 * @return {[type]} [description]
	 */
	DateTime.prototype.downDay = function(){
		return this._downDisplacement('day');
	};
	/**
	 * [downHours 向下获取小时]
	 * @return {[type]} [description]
	 */
	DateTime.prototype.downHours = function(){
		return this._downDisplacement('hours');
	};
	/**
	 * [downMinutes 向下获取分钟]
	 * @return {[type]} [description]
	 */
	DateTime.prototype.downMinutes = function(){
		return this._downDisplacement('minutes');
	};
	/**
	 * [down 向下获取函数式]
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	DateTime.prototype.down = function(value){
		return this._downDisplacement(value);
	};
	/**
	 * [getTime 根据一个对象拼装一个时间对象获取时间毫秒]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
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
	/**
	 * [setCurNewDate 设置一个当前新的时间对象]
	 */
	DateTime.prototype.setCurNewDate = function(long){
		this.date = null;
		this.date = long ? new Date(long) : new Date();
		this._setAttrs();
	};
	DateTime.prototype._setAttrs = function(){
		this.attrs = null;
		this.attrs = {
			'year':this.date.getFullYear(),
			'month':this.date.getMonth() + 1,
			'day':this.date.getDate(),
			'hours':this.date.getHours(),
			'minutes':this.date.getMinutes()
		};
	};
	/**
	 * [difference 根据一个毫秒差返回一个时分秒对象]
	 * @param  {[type]} duration [description]
	 * @return {[type]}          [description]
	 */
	DateTime.difference = function(duration){
		var result = {};
		var leave1 = duration%(24*3600*1000);
		var hour = Math.floor(leave1/(3600*1000));
		result.hours = hour < 10 ? '0'+hour : hour;
		var leave2 = leave1%(3600*1000);
		var minutes = Math.floor(leave2/(60*1000));
		result.minutes = minutes < 10 ? '0'+minutes : minutes;
		var leave3 = leave2%(60*1000);
		var seconds = Math.floor(leave3/1000);
		result.seconds = seconds < 10 ? '0'+seconds : seconds;
		return result;
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

Date.prototype.Format = function(fmt)
{ //author: meizz
	var o = {
		"M+" : this.getMonth()+1,                 //月份
		"d+" : this.getDate(),                    //日
		"h+" : this.getHours(),                   //小时
		"m+" : this.getMinutes(),                 //分
		"s+" : this.getSeconds(),                 //秒
		"q+" : Math.floor((this.getMonth()+3)/3), //季度
		"S"  : this.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt))
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("("+ k +")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	return fmt;
}