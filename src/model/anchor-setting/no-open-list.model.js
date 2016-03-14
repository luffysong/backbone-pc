/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseModel = require('BaseModel');
var Model = BaseModel.extend({
	url:'{{url_prefix}}/room/no_open_list.json?deviceinfo={"aid":"30001001"}&access_token={{access_token}}&order={{order}}&offset={{offset}}&size={{size}}',//填写请求地址
	beforeEmit:function(options){
		// 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
		// this.storageCache = true; //开启本地缓存
		// this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	},
	formatter:function(response){
		console.log(response);	
	}
});
var shared = null;
Model.sharedInstanceNoOpenListModel = function(){
	if (!shared) {
		shared = new Model();
	};
	return shared;
};
module.exports = Model;