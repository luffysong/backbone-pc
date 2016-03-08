var BaseModel = require('BaseModel');
var cookie = require('cookie');
var CHECK_VIP_SERVICE = "http://vip.yinyuetai.com/vip/check-vip";
var CheckVIPModel = BaseModel.extend({
	url:CHECK_VIP_SERVICE,
	setEnv:true,
	beforeEmit:function(){

	}
});
var checkVIPModel = new CheckVIPModel();
var UserModel = BaseModel.extend({
	setEnv:true, //自己定义环境变量，不使用config配置文件
	beforeEmit:function(options){
		// 如果需要开启对请求数据的本地缓存，可将下列两行注释去掉
		// this.storageCache = true; //开启本地缓存
		// this.expiration = 1; //设置缓存过期时间（1表示60*60*1000 一小时）
		
	},
	//检查是否已经登录
	isLogined:function(){
		return ~~this.$get('userId') ? true : false;
	},
	//检查是否为VIP用户
	checkVIPUser:function(){
		
	},
	//同步判断是否是vip用户
	isVIPUser:function(){
		var token = Cookie.get('token');
		if(token){
			var list = token.split(".");
			if(list.length > 2){
				var val = list[2];
				return parseInt(val[0]) > 0;
			};
		}
		return false;
	},
	fetchToken:function(){
		return cookie.get('token');
	}
});
var shared = null;
UserModel.sharedInstanceUserModel = function(){
	if (!shared) {
		shared = new UserModel();
	}
	return shared;
};
UserModel.classInstanceUserModel = function(){
	return new UserModel();
};
module.exports = UserModel;