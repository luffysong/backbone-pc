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
var Mask = require('./mask.js');
var mask = Mask.classInstanceMask();
var View = BaseView.extend({
	clientRender:false,
	events:{ //监听事件
		'click .J_close': '_close'
	},
	//当模板挂载到元素之前
	beforeMount:function(){
		this.options = {
			width: '',    //box宽度
			height: '',   //box高度
			hasMark: true, //是否显示遮罩层
			hasClose: true,    //是否显示关闭按钮
			isRemoveAfterHide: true,   //隐藏后是否自动销毁相关dom
			isAutoShow: true,  //是否自动显示dialog
			title: '',
			className: '',
			effect: 'fade',    //显示效果 可选none, fade
			draggable: false,
			onShow: function () {},
			onHide: function () {}
		};
		this.options = _.extend(this.options,this._ICEOptions);
		this._status = false;
		this.$el = $('<div class="dialog"/>')
				.append(this.$el.show())
				.addClass(this.options.className)
				.appendTo(document.body);
		this._ICEinitEvent();
	},
	//当模板挂载到元素之后
	afterMount:function(){
		this.closeTemp = require('./template/close.html');
		this.titleTemp = require('./template/title.html');
	},
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready:function(){
		this._renderTitle();
		this._renderClose();
		this._adjustPosition();
		this.on('show', function () {
			this._status = true;
			this._toggle('show');
		});
		this.on('hide', function () {
			this._status = false;
			this._toggle('hide');
		});
		this.on('show', this.options.onShow, this.$el);
		this.on('hide', this.options.onHide, this.$el);
		if (this.options.isAutoShow) {
			this.trigger('show');
		};
	},
	_renderTitle: function () {
		var title = this.options.title;
		if (title) {
			var titleHTML = this.titleTemp.replace('{{title}}',title);
			this.$title = $(titleHTML).prependTo(this.$el);
		};
	},
	_renderClose: function () {
		if (this.options.hasClose) {
			$(this.closeTemp).attr('hidefocus', 'true').appendTo(this.$el);
		}
	},
	_adjustPosition: function () {
		var size = {
			width: this.options.width || this.$el.innerWidth(),
			height: this.options.height ? (this.options.title != '' ? this.options.height+30 : this.options.height) : this.$el.innerHeight()
		};
		this.$el.css(_.extend({
			marginLeft: -(size.width / 2),
			marginTop: -(size.height / 2)
		}, size));
	},
	_close: function () {
		this.trigger('hide');
	},
	_toggle: function (action) {
		var effect = this.options.effect;
		var self = this;
		if (action == 'show') {
			if (effect === 'none') {
				this.$el.css('display', 'block');
			} else if (effect === 'fade') {
				this.$el.fadeIn();
			};
		} else if (action == 'hide') {
			if (effect === 'none') {
				this.$el.css('display', 'none');
			} else if (effect === 'fade') {
				this.$el.fadeOut();
			};
			if (this.options.isRemoveAfterHide) {
				setTimeout(function () {
					self.$el.remove();
				}, 2000);
			};
		}
		this._toggleMask(action);
	},
	_toggleMask: function (action) {
		if (this.options.hasMark) {
			if (action == 'show') {
				mask.show();
			} else if (action == 'hide') {
				mask.hide();
			};
		};
	},
	status: function () {
		return this._status ? 'show' : 'hide';
	},
	show: function () {
		this.trigger('show');
		return this;
	},
	hide: function () {
		this.trigger('hide');
		return this;
	},
	destroy: function () {
		this.$el.remove();
		mask.hide();
	},
	resize: function (width, height) {
		this.options.width = width;
		this.options.height = height;
		this._adjustPosition();
		return this;
	},
	title: function (title) {
		this.$title && this.$title.html(title);
		return this;
	}
});
var shared = null;
View.sharedInstanceDialog = function(options){
	if (!shared) {
		shared = new View(options || {});
	}
	return shared;
};
View.classInstanceDialog = function(content, options){
	options = options || {};
	options.el = content || '<b></b>';
	return new View(options);
};
module.exports = View;