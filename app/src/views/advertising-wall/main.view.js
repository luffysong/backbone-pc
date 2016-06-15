/**
 * 告白墙
 */
'use strict';

var _ = require('underscore');
var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;

var ListModel = require('../../models/advertising-wall/list.model');
var LikeModel = require('../../models/advertising-wall/like.model');
var CreateModel = require('../../models/advertising-wall/create.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

// var uiConfirm = require('ui.confirm');
var msgBox = require('ui.msgBox');
var BusinessDate = require('BusinessDate');

var View = BaseView.extend({
  el: '',
  rawLoader: function () {
    return require('./template/wall.html');
  },
  events: {
    'click #btnShowCreate': 'showCreateClicked',
    'click #btnBacktoList': 'backToList',
    'click .wall-list': 'itemClicked',
    'click #btnSendText': 'sendClicked',
    'click .tabs a': 'changeTab',
    'click .colors a': 'chooseColorClicked',
    'keyup #txtMsg': 'calcTextLength',
    'click #unReadCnt': 'refreshList'
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

    this.listParams = _.extend({
      size: 9
    }, this.queryParams);

    this.listModel = new ListModel();
    this.likeModel = new LikeModel();
    this.createModel = new CreateModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.elements.showCreateDOM = this.$el.find('#btnShowCreate');
    this.elements.showWhenCreateDom = this.$el.find('.show-when-create');
    this.elements.showWhenListDom = this.$el.find('.show-when-list');
    this.elements.boardDom = this.$el.find('.msg-board-wrap');

    this.elements.txtInputDom = this.$el.find('#txtMsg');
    this.elements.txtLengthDom = this.$el.find('#txtLength');
    this.elements.anonymousDom = this.$el.find('#cbAnonymous');
    this.elements.userScoreDom = this.$el.find('#userScore');
    this.elements.unReadCnt = this.$el.find('#unReadCnt');


    // 一个公告的模板
    this.itemTpl = this.$el.find('#itemTpl').html();

    this.newestListDOM = this.$el.find('.newList .am-u-sm-4');
  },
  ready: function (ops) {
    this.options = _.extend({}, ops);
    this.defineEventInterface();
    //  初始化
    this.renderNewestList();
  },
  setOptions: function (ops) {
    this.options = _.extend(this.options, ops);
  },
  defineEventInterface: function () {
    var self = this;
    Backbone.on('event:currentUserInfoReady', function (data) {
      self.setUserInfo(data);
    });
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  // 我要发布点击
  showCreateClicked: function () {
    this.elements.showWhenCreateDom.show();
    this.elements.showWhenListDom.hide();
    this.elements.boardDom.addClass('active-create');
  },
  // 返回列表
  backToList: function () {
    this.elements.showWhenCreateDom.hide();
    this.elements.showWhenListDom.show();
    this.elements.boardDom.removeClass('active-create');
  },
  // 最新列表
  renderNewestList: function (ops) {
    var self = this;
    this.listParams = _.extend(this.listParams, {
      roomId: self.options.roomId || 0,
      sortField: 'TIME', // LIKE
      limit: 9
    }, ops);
    var promise = this.listModel.executeJSONP(this.listParams);
    promise.done(function (res) {
      self.appendToNewestList(res.data.list || []);
    });

    // TODO
    // self.appendToNewestList([1, 2, 3, 4, 5, 6, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 554]);
  },
  appendToNewestList: function (data) {
    var htmls = this.createItemHtml(data);
    console.log(htmls);
    this.newestListDOM.eq(0).append(htmls[0]);
    this.newestListDOM.eq(1).append(htmls[1]);
    this.newestListDOM.eq(2).append(htmls[2]);
  },
  // 最热列表
  renderHotList: function () {

  },
  createItemHtml: function (data) {
    var html = '';
    var self = this;
    var result = [[], [], []];
    _.each(data, function (item, index) {
      var curItem = item;
      curItem.time = BusinessDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss');
      html = self.compileHTML(self.itemTpl, curItem);
      var res = index % 3;
      switch (res) {
        default:
        case 0:
          result[0].push(html);
          break;
        case 1:
          result[1].push(html);
          break;
        case 2:
          result[2].push(html);
          break;
      }
    });
    return result;
  },
  renderItem: function () {

  },
  itemClicked: function (e) {
    var target = $(e.target);
    if (!target.attr('data-likeid')) {
      target = target.parent('a');
    }
    var liked = target.attr('data-liked') === 'true';
    if (target.attr('data-likeid')) {
      this.likeItem(target.attr('data-likeid'), target, !liked);
    }
  },
  // 喜欢某个告白
  likeItem: function (id, dom, like) {
    this.likeParams = _.extend(this.queryParams, {
      cmtId: id,
      like: like
    });
    var promise = this.likeModel.executeJSONP(this.likeParams);
    var cnt = ~~dom.find('span').text();
    promise.done(function (res) {
      if (res && res.code === '0') {
        dom.attr('data-liked', like ? 'true' : 'false');
        dom.find('span').text(like ? cnt + 1 : cnt - 1);
      } else {
        msgBox.showTip('支持失败,稍后重新尝试吧');
      }
    });
  },
  // 切换列表
  changeTab: function (e) {
    var target = $(e.target);
    var tab = target.attr('data-tab');
    if (tab) {
      $('.tabs a').toggleClass('active');
      $('.tab').hide();
      $('.' + tab).show();
    }
  },
  getSendText: function () {
    var text = $.trim(this.elements.txtInputDom.val());
    var reg = /<[^>]+?>/g;
    text = text.replace(reg, '');
    return text;
  },
  // 校验发布内容
  verifyText: function () {
    var text = this.getSendText();
    if (text.length > 200) {
      msgBox.showTip('告白内容不能超过200字');
      return false;
    } else if (text.length < 20) {
      msgBox.showTip('告白内容至少输入20个字');
      return false;
    }
    return true;
  },
  sendClicked: function () {
    var isAnonymous = this.elements.anonymousDom.is(':checked');
    var self = this;
    if (this.verifyText()) {
      this.createParams = _.extend({
        roomId: this.options.roomId,
        isAnonymous: isAnonymous,
        fontColor: this.selectedColor || '',
        content: this.getSendText()
      }, this.queryParams);

      var promise = this.createModel.executeJSONP(this.createParams);

      promise.done(function (res) {
        if (res && res.code === '0') {
          msgBox.showOK('告白发布成功!');
          self.elements.txtInputDom.val('');
        } else {
          msgBox.showError(res.msg || '发布告白失败,请稍后重试');
        }
      });
    }
  },
  // 设置文字颜色
  setTextColor: function (dom, color) {
    if (dom && color) {
      var col = this.rgb2hex(color + '');
      dom.css('color', col);
      this.selectedColor = col;
    }
  },
  // 选择颜色
  chooseColorClicked: function (e) {
    var target = $(e.target);
    var color = target.css('background-color');
    this.setTextColor(this.elements.txtInputDom, color);
  },
  // 计算文字长度
  calcTextLength: function () {
    var txt = $.trim(this.elements.txtInputDom.val());
    var maxLength = 200;
    if (maxLength >= txt.length) {
      this.elements.txtLengthDom.text(maxLength - txt.length);
      return true;
    }
    return false;
  },
  // 数字转16进制
  zeroFillHex: function (num, digits) {
    var s = num.toString(16);
    while (s.length < digits) {
      s = '0' + s;
    }
    return s;
  },
  // 颜色转换
  rgb2hex: function (rgb) {
    if (rgb.charAt(0) === '#') {
      return rgb;
    }

    var ds = rgb.split(/\D+/);
    var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
    return '#' + this.zeroFillHex(decimal, 6);
  },
  // 设置用户积分
  setUserInfo: function (userInfo) {
    this.options.userInfo = userInfo;
    if (userInfo.totalMarks) {
      this.elements.userScoreDom.text(userInfo.totalMarks);
    }
  },
  refreshList: function () {
    this.elements.unReadCnt.text(0).hide();
    $('.newList .am-u-sm-4').children().remove();
    this.renderNewestList();
  }
});

module.exports = View;
