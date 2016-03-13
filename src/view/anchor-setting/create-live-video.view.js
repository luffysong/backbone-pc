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
var DateTime = require('DateTime');
var CreateLiveModel = require('../../model/anchor-setting/create-live-video.model');
var ArtistCompleteModel = require('../../model/anchor-setting/artist-autocomplete.model');
var lighten;    
var View = BaseView.extend({
	el: '#createLiveVideo', //设置View对象作用于的根元素，比如id
	rawLoader: function() { //可用此方法返回字符串模版
		return require('../../template/anchor-setting/create-live-video.html');
	},
	events: { //监听事件			
		'click #createVideo':'createVideoHandler',
		'click .select':'dateTimeToggle',
		'click .selectDate li':'selectDateHandler',
		'keyup #inputActorName':'actorNameHandler',
		'blur #inputActorName':'actorNameBlurHandler',
		'click #selectorActor li':'selectorActorHandler',
		'change #inputActorName':''       
	},
	//当模板挂载到元素之前
	beforeMount: function() {
		this.actorName = null;
		this.videoName = null;
		this.createClick = false;
		this.createLock = true;
		this.dateTime = new DateTime();
		this.mapKey = [
			'year',
			'month',
			'day',
			'hours',
			'minutes'
		];
		this.createData = {
			'roomName':'',
			'roomDesc':'',
			'artistId':'',
			'liveTime':0
		};
		this.createDate = {};
	},
	//当模板挂载到元素之后
	afterMount: function() {
		this.selectorActor = this.$el.find('#selectorActor');
		this.actorTemp = this.$el.find('#selectorActorTemp').html();
		this.createVideo = this.$el.find('#createVideo');
		this.actorName = this.$el.find('#inputActorName');
		this.videoName = this.$el.find('#liveVideoName');
		this.liveTime = this.$el.find('#liveTime');
		this.liveTimeTemp = this.$el.find('#liveTimeTemp').html();
		this.cellsTemp = this.$el.find('#cellsTemp').html();
	},     
	//当事件监听器，内部实例初始化完成，模板挂载到文档之后
	ready: function() {
		this.artistModel = new ArtistCompleteModel();
		this.createModel = new CreateLiveModel();
		this.initRender();
		this.initListener();              
	},
	initRender:function(){
		var data = this.dateDataStructure();
		var dateHTML = this.compileHTML(this.liveTimeTemp,{'items':data});
		this.liveTime.html(dateHTML);
		this.liveTimeUl = this.liveTime.find('.select>ul');
		this.liveTimeSpan = this.liveTime.find('.date');
		this.liveLength = this.liveTimeUl.length;
	},
	initListener:function(){
		var self = this;
		lighten = setInterval(function(){
			var actor = self.actorName.val();
			var video = self.videoName.val();
			if (actor&&video) {
				self.createVideo.removeClass('m_disabled');
				self.createClick = true;           
			}else{
				if (actor || video) {
					self.createVideo.addClass('m_disabled');
					self.createClick = false;
				};
			};    
		},0);
	},
	dateDataStructure:function(){
		var data = [];
		var i = 0;
		var l = this.mapKey.length;
		for(;i<l;i++){
			var key = this.mapKey[i];
			var d = {
				'tag':key,
				'cur':this.dateTime.$get(key),
				'style':''
			};
			this.createDate[key] = d.cur;
			switch(key){
				case 'year':
					d.cells = this.dateTime.ceilYear(2);
					d.name = '年';
					break;
				case 'month':
					d.cells = this.dateTime.downMonth();
					d.name = '月';
					break;
				case 'day':
					d.division = true;
					d.style = 'margin-left: 68px;'
					d.cells = this.dateTime.downDay();
					d.name = '日';
					break
				case 'hours':
					d.cells = this.dateTime.downHours();
					d.name = '时';
					break
				default:
					d.cells = this.dateTime.downMinutes();
					d.name = '分';
					break;
			}
			data.push(d);
		};
		return data;
	},
	dateTimeToggle:function(e){
		e.stopPropagation();
		var el = $(e.currentTarget);
		var index = ~~el.data('index');
		var ul = $(this.liveTimeUl[index]);
		ul.toggle();
	},
	selectDateHandler:function(e){
		var el = $(e.currentTarget);
		var val = el.text();
		var parent = el.parent();
		var index = ~~parent.data('index');
		var tag = parent.data('tag');
		var span = $(this.liveTimeSpan[index]);
		var _val = span.text();
		if (_val === val) {
			return;
		};
		span.text(val);
		this.createDate[tag] = val;
		var start = this.liveLength 
		console.log(index);
		console.log(this.liveLength)
	},
	actorNameHandler:function(e){
		var el = $(e.currentTarget);
		var val = $.trim(el.val());
		if (!val) {
			this.selectorActor.empty();
			return;
		};
		var self = this;
		this.artistModel.setChangeURL({
			'keyword':val
		});
		this.artistModel.execute(function(response){
			var items = response.data.list;
			self.selectorActor.html(self.compileHTML(self.actorTemp,{'items':items}));
			self.selectorActor.show();
		},function(e){

		});
	},
	actorNameBlurHandler:function(e){
		//this.selectorActor.hide();
	},
	selectorActorHandler:function(e){
		var el = $(e.currentTarget);
		var inputVal = el.text();
		this.createData.artistId = el.attr('data-id');
		this.actorName.val(inputVal);
		this.selectorActor.hide();
	},
	createVideoHandler:function(e){
		if (this.createClick && this.createLock) {
			clearInterval(lighten);
			this.createLock = false;
			this.createData.roomName = this.actorName.val();
			this.createData.liveTime = this.dateTime.getTime(this.createDate);
			console.log(this.createData);
		}
	}
});

module.exports = View;
