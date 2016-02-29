/*
	clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

var BaseView = require('../../YYT_PC_Modules/baseView'); //View的基类

var View = BaseView.extend({
	el:'', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		var template = require('../template/index');
		return template; 
	},
	events:{ //监听事件

	},
	//当模板挂载到元素之前
	beforeMount:function(){

	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		
	}
});

module.exports = View;