/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

var BaseModel = require('BaseModel');
var Model = BaseModel.extend({
	url:'{{url_prefix}}/mock/mock.json',//填写请求地址
	beforeEmit:function(options){
		// 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
		// this.storageCache = true; //开启本地缓存
		// this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
	}
	// formatter:function(response){
	//		//formatter方法可以格式化数据
	// }
});
module.exports = Model;