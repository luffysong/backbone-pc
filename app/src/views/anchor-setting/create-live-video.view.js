'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var BusinessDate = require('BusinessDate');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var CreateLiveModel = require('../../models/anchor-setting/create-live-video.model');
var ArtistCompleteModel = require('../../models/anchor-setting/artist-autocomplete.model');
var lighten;
var msgBox = require('ui.msgBox');
var timeImage = require('../../../images/select-ico.jpg');
var View = BaseView.extend({
  el: '#createLiveVideo',
  events: { //  监听事件
    'click #createVideo': 'createVideoHandler',
    'click .select': 'businessDateToggle',
    'click .selectDate li': 'selectDateHandler',
    'keyup #inputActorName': 'actorNameHandler',
    'blur #inputActorName': 'actorNameBlurHandler',
    'click #selectorActor li': 'selectorActorHandler',
    'change #inputActorName': ''
  },
  rawLoader: function () {
    return require('./template/create-live-video.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.actorName = null;
    this.videoName = null;
    this.createClick = false;
    this.createLock = true;
    this.businessDate = new BusinessDate();
    this.mapKey = [
      'year',
      'month',
      'day',
      'hours',
      'minutes'
    ];
    this.createData = {
      deviceinfo: '{"aid":"30001001"}',
      roomName: '',
      roomDesc: '',
      artistId: '',
      artistName: '',
      liveTime: 0,
      access_token: 'web-' + user.getToken()
    };
    this.createDate = {};
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.selectorActor = this.findDOMNode('#selectorActor');
    this.actorTemp = this.findDOMNode('#selectorActorTemp').html();
    this.createVideo = this.findDOMNode('#createVideo');
    this.actorName = this.findDOMNode('#inputActorName');
    this.videoName = this.findDOMNode('#liveVideoName');
    this.liveTime = this.findDOMNode('#liveTime');
    this.liveTimeTemp = this.findDOMNode('#liveTimeTemp').html();
    this.cellsTemp = this.findDOMNode('#cellsTemp').html();
    this.hours = this.compileHTML(this.cellsTemp, { cells: this.eachMost(0, 23) });
    this.minutes = this.compileHTML(this.cellsTemp, { cells: this.eachMost(0, 59) });
  },
  ready: function () {
    //  初始化
    this.artistModel = new ArtistCompleteModel();
    this.createModel = new CreateLiveModel();
    this.initRender();
    this.initListener();
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  initRender: function () {
    var data = this.dateDataStructure();
    var dateHTML = this.compileHTML(this.liveTimeTemp, { items: data, timeImage: timeImage });
    this.liveTime.html(dateHTML);
    this.liveTimeUl = this.liveTime.find('.select>ul');
    this.liveTimeSpan = this.liveTime.find('.date');
    this.liveLength = this.liveTimeUl.length - 1;
  },
  initListener: function () {
    var self = this;
    lighten = setInterval(function () {
      var actor = self.actorName.val();
      var video = self.videoName.val();
      if (actor && video) {
        self.createVideo.removeClass('m_disabled');
        self.createClick = true;
      } else {
        if (actor || video) {
          self.createVideo.addClass('m_disabled');
          self.createClick = false;
        }
      }
    }, 0);
  },
  dateDataStructure: function () {
    var data = [];
    var i = 0;
    var l = this.mapKey.length;
    for (; i < l; i++) {
      var key = this.mapKey[i];
      var d = {
        tag: key,
        cur: this.businessDate.$get(key),
        style: ''
      };
      this.createDate[key] = d.cur;
      switch (key) {
        case 'year':
          d.cells = this.businessDate.ceilYear(0);
          d.name = '年';
          break;
        case 'month':
          d.cells = this.businessDate.downMonth();
          d.name = '月';
          break;
        case 'day':
          d.cells = this.businessDate.downDay();
          d.name = '日';
          d.division = true;
          break;
        case 'hours':
          d.style = 'margin-left: 68px;';
          d.cells = this.businessDate.downHours();
          d.name = '时';
          break;
        default:
          d.cells = this.businessDate.downMinutes();
          d.name = '分';
          break;
      }
      data.push(d);
    }
    return data;
  },
  businessDateToggle: function (e) {
    e.stopPropagation();
    var el = $(e.currentTarget);
    var index = ~~el.data('index');
    var ul = $(this.liveTimeUl[index]);
    ul.toggle();
  },
  selectDateHandler: function (e) {
    var el = $(e.currentTarget);
    var val = el.text();
    var parent = el.parent();
    var index = ~~parent.data('index');
    var tag = parent.data('tag');
    var span = $(this.liveTimeSpan[index]);
    var _val = span.text();
    if (_val === val) {
      return;
    }
    val = ~~val;
    span.text(val);
    this.createDate[tag] = val;
    var start = index + 1;
    var defaD = 1;
    var defaHM = 0;
    var html;
    var days;
    var curs;
    var downs;
    if (tag === 'month' && val === this.businessDate.$get('month')) {
      this.businessDate.setCurNewDate();
      curs = true;
    }
    for (; start <= this.liveLength; start++) {
      var curUl = $(this.liveTimeUl[start]);
      var curSpan = $(this.liveTimeSpan[start]);
      var _tag = curUl.data('tag');
      downs = null;
      if (curs) {
        downs = this.businessDate.down(_tag);
        html = this.compileHTML(this.cellsTemp, { cells: downs });
        curSpan.text(downs[0]);
        curUl.html(html);
        continue;
      }
      switch (_tag) {
        case 'day':
          days = this.businessDate.getCountDays(val);
          html = this.compileHTML(this.cellsTemp, { cells: this.eachMost(1, days) });
          curSpan.text(defaD);
          curUl.html(html);
          break;
        case 'hours':
          curUl.html(this.hours);
          curSpan.text(defaHM);
          break;
        default:
          curUl.html(this.minutes);
          curSpan.text(defaHM);
          break;
      }
    }
  },
  eachMost: function (start, end) {
    var result = [];
    var _start = start;
    var _end = end;
    for (; _start <= _end; _start++) {
      result.push(_start);
    }
    return result;
  },
  actorNameHandler: function (e) {
    var el = $(e.currentTarget);
    var val = $.trim(el.val());
    if (!val) {
      this.selectorActor.empty();
      return;
    }
    var self = this;
    var promise = this.artistModel.executeJSONP({
      keyword: val,
      deviceinfo: '{"aid":"30001001"}'
    });
    promise.done(function (response) {
      var items = response.data.list;
      self.selectorActor.html(self.compileHTML(self.actorTemp, { items: items }));
      self.selectorActor.show();
    });
    promise.fail(function () {
      msgBox.showError('输入有误');
    });
  },
  actorNameBlurHandler: function () {
    //  this.selectorActor.hide();
  },
  selectorActorHandler: function (e) {
    var el = $(e.currentTarget);
    var inputVal = el.text();
    this.createData.artistId = ~~el.attr('data-id');
    this.actorName.val(inputVal);
    this.selectorActor.hide();
  },
  createVideoHandler: function () {
    var self = this;
    if (this.createClick && this.createLock) {
      clearInterval(lighten);
      var date = new Date();
      var time = date.getTime() + (1000 * 60 * 60 * 1);
      this.createLock = false;
      this.createData.roomName = this.videoName.val();
      this.createData.artistName = this.actorName.val();
      this.createData.liveTime = this.businessDate.getTime(this.createDate);
      if (this.createData.liveTime < time) {
        msgBox.showError('直播时间至少为一小时之后');
        this.createLock = true;
        self.initListener();
        return;
      }
      var promise = this.createModel.executeJSONP(this.createData);
      promise.done(function (response) {
        var code = ~~response.code;
        if (!code) {
          msgBox.showOK('创建成功');
          window.location.reload();
        } else {
          msgBox.showError(response.msg);
          self.createLock = true;
          self.initListener();
        }
      });
      promise.fail(function () {
        msgBox.showError('创建失败');
        self.createLock = true;
        self.initListener();
      });
    }
  }
});

module.exports = View;
