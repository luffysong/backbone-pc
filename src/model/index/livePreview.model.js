/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseModel = require('BaseModel');
var sigleInstance = null;
var DateTime = require('DateTime');
var dateTime = new DateTime();
var Model = BaseModel.extend({
	url:'{{url_prefix}}/room/home_hot_list.json',//填写请求地址
	beforeEmit:function(options){
		// 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
		// this.storageCache = true; //开启本地缓存
		// this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	},
	formatter:function(response){
		//formatter方法可以格式化数据
		var code = ~~response.code;
		if (!code) {
			var data = response.data;
			var i = data.length;
			while (i--) {
				var item = data[i];
				if (item.status === 1) {
					dateTime.setCurNewDate(item.liveTime);
					var year = dateTime.$get('year');
					var month = dateTime.$get('month');
					var day = dateTime.$get('day');
					var _hours = dateTime.$get('hours');
					var hours = _hours < 10 ? '0'+_hours : _hours;
					var _minutes = dateTime.$get('minutes');
					var minutes = _minutes < 10 ? '0'+_minutes : _minutes;
					item.liveVideoTime = year+'/'+month+'/'+day+' '+hours+':'+minutes;
				}
			}
		}
		return response;
	}
});

/**
 * 获取单例对象
 */
Model.sigleInstance = function(){
	if(!sigleInstance){
		sigleInstance = new Model();
	}
	return sigleInstance;
};

module.exports = Model;
