// 创建频道节目单
'use strict';

var Backbone = window.Backbone;
var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var CreateShowModel = require('../../models/channel/create-channel-show.model');

var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: '#createChannelPlayBlock',
  rawLoader: function () {
    return require('./template/create-channel-play.html');
  },
  events: {
    'click #btnCreateShow': 'createShowClicked'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.elements = {};
    this.queryParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken()
    };
    this.createModel = new CreateShowModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.elements.showName = this.$el.find('#channelShowName');
    this.elements.channelShowNum = this.$el.find('#channelShowNum');
    this.elements.videoIds = this.$el.find('#channelVideoList');
    this.elements.startTime = this.$el.find('#channelSHowStartTime');
  },
  ready: function () {
    //  初始化
    this.defineEventInterface();
    this.initPicker();
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('evernt:channelSelected', function (info) {
      self.channelInfo = info;
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  createShowClicked: function () {
    if (this.verifyForm()) {
      this.createShow();
    }
  },
  verifyForm: function () {
    var name = $.trim(this.elements.showName.val());
    var num = $.trim(this.elements.channelShowNum.val());
    var idTxt = $.trim(this.elements.videoIds.val());
    var ids = idTxt.split(/[\s,，]/g);
    var startTime = new Date(this.elements.startTime.val());
    ids = _.filter(ids, function (item) {
      return item.length > 0 && (!isNaN(item));
    });
    if (name.length <= 0) {
      msgBox.showTip('请输入节目单名称!');
      return false;
    }
    if (num <= 0 || num >= 6) {
      msgBox.showTip('请输入大于零并且小于等于5的正整数!');
      return false;
    }
    if (ids.length <= 0) {
      msgBox.showTip('请输入有效的视屏编号!');
      return false;
    }
    if (!this.elements.startTime.val()) {
      msgBox.showTip('请选择有效时间!');
      return false;
    }
    // 就是选择周一到周日的时间;
    if (~~startTime.getDay() < 0) {
      msgBox.showTip('请选择开始时间!');
      return false;
    }
    this.formData = {
      showName: name,
      carouselTimes: num,
      mvIds: '[' + ids.join(',') + ']',
      beginTime: startTime.getTime()
    };
    return true;
  },
  createShow: function () {
    var self = this;
    if (!this.channelInfo || !this.channelInfo.channelId) {
      msgBox.showTip('请先选择一个频道!!!');
      return;
    }
    if (this.isSaving) {
      return;
    }
    this.isSaving = true;
    this.createModel.executeJSONP(_
        .extend({
          channelId: this.channelInfo.channelId
        }, this.formData, this.queryParams))
      .done(function (res) {
        if (res && res.code === '0') {
          msgBox.showOK('节目单添加成功');
          Backbone.trigger('event:ChannelShowAdded');
          self.resetForm();
          self.isSaving = false;
        } else {
          msgBox.showError(res.msg || '节目单创建失败，请稍后重试!');
          self.isSaving = false;
        }
      });
  },
  resetForm: function () {
    this.elements.showName.val('');
    this.elements.channelShowNum.val('');
    this.elements.videoIds.val('');
    this.elements.startTime.val('');
  },
  initPicker: function () {
    $('.form-datetime').datetimepicker({
      language: 'zh-CN',
      format: 'yyyy-mm-dd hh:ii',
      autoclose: true,
      startDate: new Date()
    });
    // $dpInput.datetimepicker('update', new Date());
  }
});

module.exports = View;
