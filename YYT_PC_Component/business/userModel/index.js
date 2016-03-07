var BaseModel = require('BaseModel');
var cookie = require('cookie');
var CHECK_VIP_SERVICE = "http://vip.yinyuetai.com/vip/check-vip";
var UserModel = BaseModel.extend({
	url:'',//填写请求地址
	setEnv:true, //自己定义环境变量，不使用config配置文件
	beforeEmit:function(options){
		// 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
		// this.storageCache = true; //开启本地缓存
		// this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
		
	}
	// formatter:function(response){
	//		//formatter方法可以格式化数据
	// }
});
var shared = null;
UserModel.sharedInstanceUserModel = function(){
	if (!shared) {
		shared = new UserModel();
	}
	return shared;
};

module.exports = UserModel;