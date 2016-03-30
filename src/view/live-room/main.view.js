/*
	clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var URL = require('url');
var uiConfirm = require('ui.Confirm');


var View = BaseView.extend({
	clientRender: false,
	el: '#anchorContainerBg', //设置View对象作用于的根元素，比如id
	events:{ //监听事件

	},
	//当模板挂载到元素之前
	beforeMount:function(){
		var url = URL.parse(location.href);
		this.roomId = url.query['roomId'] || 1;

	},
	//当模板挂载到元素之后
	afterMount:function(){

	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){

		this.renderPage();
	},

	renderPage: function(){
		var RoomTitle = require('./room-title.view');
		new RoomTitle();

		var ChatView = require('./chat.view');
		new ChatView();


		//$()

		this.init();


	},
	init: function(){
		var jcarousel = $('.jcarousel');

		jcarousel
			.on('jcarousel:reload jcarousel:create', function () {
				var carousel = $(this),
					width = carousel.innerWidth();

				if (width >= 600) {
					width = width / 3;
				} else if (width >= 350) {
					width = width / 2;
				}

				carousel.jcarousel('items').css('width', Math.ceil(width) + 'px');
			})
			.jcarousel({
				wrap: 'circular'
			});

		$('.jcarousel-control-prev')
			.jcarouselControl({
				target: '-=1'
			});

		$('.jcarousel-control-next')
			.jcarouselControl({
				target: '+=1'
			});

		$('.jcarousel-pagination')
			.on('jcarouselpagination:active', 'a', function() {
				$(this).addClass('active');
			})
			.on('jcarouselpagination:inactive', 'a', function() {
				$(this).removeClass('active');
			})
			.on('click', function(e) {
				e.preventDefault();
			})
			.jcarouselPagination({
				perPage: 1,
				item: function(page) {
					return '<a href="#' + page + '">' + page + '</a>';
				}
			});
	}

});

module.exports = View;