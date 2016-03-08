/*
	clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

var BaseView = require('BaseView'); //View的基类
var url = require('url');
var IndexModel = require('../model/index.model');

var View = BaseView.extend({
	el:'#index', //设置View对象作用于的根元素，比如id
	rawLoader:function(){ //可用此方法返回字符串模版
		var template = require('../template/index.html');
		return template; 
	},
	events:{ //监听事件
		'click #goto':'gotoHandler'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.query = url.parseSearch(window.location.search);
	},
	//当模板挂载到元素之后
	afterMount:function(){
		var self = this;
		this.indexTemplate = this.$el.find('#indexTemplate').html();
		this.indexModel = new IndexModel();
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		var self = this;
		this.indexModel.execute(function(response){
			self.demoRender();
		},function(e){

		});
	},
	demoRender:function(){
		var data = this.indexModel.$get();
		var html = this.compileHTML(this.indexTemplate,data);
		this.$el.html(html);
	},
	gotoHandler:function(e){
		window.location.href = "http://www.163.com"
	}
});

module.exports = View;