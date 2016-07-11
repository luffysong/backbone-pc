/**
 * 告白墙
 */
'use strict';

var _ = require('underscore');
var base = require('base-extend-backbone');
var BaseView = base.View;

var ListModel = require('../../models/advertising-wall/list.model');
var LikeModel = require('../../models/advertising-wall/like.model');
var CreateModel = require('../../models/advertising-wall/create.model');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var LoopModel = require('../../models/advertising-wall/loop.model');

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
    'click .tabs a': 'tabClicked',
    'click .colors a': 'chooseColorClicked',
    'keyup #txtMsg': 'calcTextLength',
    'click #unReadCnt': 'refreshUnreadList'
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

    // 循环接口时间
    this.loopTime = 10 * 1000;

    this.listParams = _.extend({}, this.queryParams);

    this.pageParams = {
      newList: {
        hasNext: true
      },
      hotList: {}
    };

    this.listModel = new ListModel();
    this.likeModel = new LikeModel();
    this.createModel = new CreateModel();
    this.loopModel = new LoopModel();
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
    this.hotListDOM = this.$el.find('.hotList .am-u-sm-4');

    // 每个告白价值
    this.perItemFee = 5;
  },
  ready: function (ops) {
    this.options = _.extend({
      totalMarks: 0,
      userInfo: {}
    }, ops);
    this.defineEventInterface();
    this.lastTime = new Date();
    // 隐藏未读小红点
    this.elements.unReadCnt.text(0).hide();
    //  初始化
    this.renderNewestList({
      tag: 'first'
    });
    this.loopGetUnreadCount();
    // this.renderHotList();
    this.setUserInfo();

    $('.msg-board-wrap .wall-list').on('scroll', this.tabScrollDown.bind(this));
  },
  setOptions: function (ops) {
    this.options = _.extend(this.options, ops);
  },
  defineEventInterface: function () {},
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
    this.randomSetColor();
  },
  // 返回列表
  backToList: function () {
    this.elements.showWhenCreateDom.hide();
    this.elements.showWhenListDom.show();
    this.elements.boardDom.removeClass('active-create');
  },

  getData: function (ops) {
    var self = this;
    this.listParams = _.extend(this.listParams, {
      subType: this.options.type || 1,
      subId: self.options.roomId || 0,
      sortField: 'TIME', // LIKE
      limit: 9
    }, ops);
    return this.listModel.executeJSONP(this.listParams);
  },
  // 最新列表
  renderNewestList: function (ops) {
    var self = this;
    var promise = this.getData(ops);
    if (!self.pageParams.newList.hasNext) {
      return;
    }
    promise.done(function (res) {
      self.appendToNewestList(res.data.list || []);
      if (res && res.code === '0') {
        self.pageParams.newList = {
          cursor: res.data.nextCursor || null,
          hasNext: res.data.hasNext || false
        };
      }
      if (ops && ops.tag === 'first' && _.isArray(res.data.list) && res.data.list.length <= 0) {
        self.newestListDOM.eq(0).append('<div class="first">快来成为第一个告白的幸运儿</div>');
      }
    });
  },
  appendToNewestList: function (data) {
    var htmls = this.createItemHtml(data);
    this.newestListDOM.eq(0).find('.first').remove();
    this.newestListDOM.eq(0).append(htmls[0]);
    this.newestListDOM.eq(1).append(htmls[1]);
    this.newestListDOM.eq(2).append(htmls[2]);
  },
  // 最热列表
  renderHotList: function (ops) {
    var self = this;
    var op = _.extend(ops, {
      sortField: 'LIKE'
    });

    var promise = this.getData(op);
    promise.done(function (res) {
      if (res && res.code === '0') {
        self.pageParams.hotList = {
          nextCursor: res.data.nextCursor || null,
          hasNext: res.data.hasNext || false
        };
      }
      self.appendToHotList(res.data.list || []);
    });
  },
  appendToHotList: function (data) {
    var htmls = this.createItemHtml(data);
    this.hotListDOM.eq(0).append(htmls[0]);
    this.hotListDOM.eq(1).append(htmls[1]);
    this.hotListDOM.eq(2).append(htmls[2]);
  },
  createItemHtml: function (data) {
    var html = '';
    var self = this;
    var result = [
      [],
      [],
      []
    ];
    _.each(data, function (item, index) {
      var curItem = item;
      curItem.time = BusinessDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss');
      html = self.compileHTML(self.itemTpl, curItem);
      var res = index % 3;
      switch (res) {
        case 1:
          result[1].push(html);
          break;
        case 2:
          result[2].push(html);
          break;
        case 0:
        default:
          result[0].push(html);
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
      subType: this.options.type,
      cmtId: id,
      like: like
    });
    var promise = this.likeModel.executeJSONP(this.likeParams);
    var cnt = ~~dom.find('span').text();
    promise.done(function (res) {
      if (res && res.code === '0') {
        dom.attr('data-liked', like ? 'true' : 'false');
        dom.find('span').text(like ? cnt + 1 : cnt - 1);
        dom.toggleClass('active');
      } else {
        msgBox.showTip('支持失败,稍后重新尝试吧');
      }
    });
  },
  // 切换列表
  tabClicked: function (e) {
    var target = $(e.target);
    var tab = target.attr('data-tab');
    var link = $('.tabs a');
    if (tab && !target.hasClass('active')) {
      link.toggleClass('active');
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
        subType: self.options.type,
        subId: this.options.roomId,
        isAnonymous: isAnonymous,
        fontColor: this.selectedColor || '',
        content: this.getSendText()
      }, this.queryParams);

      var promise = this.createModel.executeJSONP(this.createParams);

      promise.done(function (res) {
        if (res && res.code === '0') {
          msgBox.showOK('告白发布成功!');
          self.elements.txtInputDom.val('');
          self.backToList();
          self.options.userInfo.totalMarks -= self.perItemFee;
          self.setUserInfo();
          self.newestListDOM.children().remove();
          self.pageParams.newList.hasNext = true;
          self.renderNewestList();
          // self.renderHotList();
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
    target.parent('.colors').children().removeClass('active');
    target.addClass('active');
    this.setTextColor(this.elements.txtInputDom, color);
  },
  // 随机设置颜色
  randomSetColor: function () {
    var index = Math.random() * 10 % 5 ^ 0;
    this.chooseColorClicked({
      target: $('.colors a').eq(index)
    });
  },
  // 计算文字长度
  calcTextLength: function () {
    var txt = $.trim(this.elements.txtInputDom.val());
    var maxLength = 200;
    this.elements.txtLengthDom.text(maxLength - txt.length);
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
    if (userInfo) {
      this.options.userInfo = userInfo;
    }
    if (_.isNumber(this.options.userInfo.totalMarks)) {
      this.elements.userScoreDom.text(this.options.userInfo.totalMarks || 0);
    }
  },
  refreshUnreadList: function () {
    this.lastTime = new Date();
    this.elements.unReadCnt.text(0).hide();
    $('.newList .am-u-sm-4').children().remove();
    this.renderNewestList();
    this.changeTab(0);
  },
  loopGetUnreadCount: function () {
    var self = this;
    var promise = this.loopModel.executeJSONP(_.extend({
      subType: this.options.type,
      subId: self.options.roomId,
      lastTime: self.lastTime.getTime()
    }, this.queryParams));
    promise.done(function (res) {
      if (res && res.code === '0' && res.data.newMsgCount > 0) {
        // self.elements.unReadCnt.text(res.data.newMsgCount).show();
        self.pageParams.newList.hasNext = true;

        self.newestListDOM.children().remove();
        self.renderNewestList();
      }
      setTimeout(function () {
        self.loopGetUnreadCount();
      }, self.loopTime);
    });
  },
  // 切换列表
  changeTab: function (index) {
    this.tabClicked({
      target: $('.tabs a').eq(index)
    });
  },
  tabScrollDown: function (e) {
    var tag = $('.tab-menu .active').attr('data-tab') || 'newList';
    var target = $(e.target);
    var maxHeight = $('.' + tag).find('.am-u-sm-4').height() - 404;
    var top = target.scrollTop();
    var diff = maxHeight - top;
    if (diff < 30 && this.pageParams[tag].hasNext) {
      if (tag === 'newList') {
        this.renderNewestList(this.pageParams[tag]);
      } else {
        this.renderHotList(this.pageParams[tag]);
      }
    }
  }
});

module.exports = View;
