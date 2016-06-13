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

// var uiConfirm = require('ui.confirm');
var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: '',
  rawLoader: function () {
    return require('./template/wall.html');
  },
  events: {
    'click #btnShowCreate': 'showCreateClicked',
    'click #btnBacktoList': 'backToList',
    'click .wall-list': 'itemClicked',
    'click #btnSendText': 'sendClicked'
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

    // 一个公告的模板
    this.itemTpl = this.$el.find('#itemTpl').html();

    this.newestListDOM = this.$el.find('.newList .am-u-sm-4');
  },
  ready: function () {
    //  初始化
    this.renderNewestList();
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
    this.listParams = _.extend({
      roomId: 1,
      sortField: 'TIME', // LIKE
      limit: 9
    }, ops);
    var promise = this.listModel.executeJSONP(this.listParams);
    promise.done(function (res) {
      console.log(res);
      self.appendToNewestList(res.data || []);
    });

    // TODO
    self.appendToNewestList([1, 2, 3, 4, 5, 6, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 554]);
  },
  appendToNewestList: function (data) {
    var htmls = this.createItemHtml(data);
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
    _.map(data, function (item, index) {
      html = self.compileHTML(self.itemTpl, item);
      switch (index % 3) {
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
    if (target.attr('data-likeid')) {
      this.likeItem(target.attr('data-likeid'));
    }
  },
  // 喜欢某个告白
  likeItem: function (id) {
    this.likeParams = _.extend({
      id: id
    });
    var promise = this.likeModel.executeJSONP(this.likeParams);
    promise.done(function (res) {
      if (res && res.code === '0') {
        msgBox.showOK('成功');
      } else {
        msgBox.showTip('支持失败,稍后重新尝试吧');
      }
    });
  },
  // 校验发布内容
  verifyText: function () {

  },
  sendClicked: function () {

  }

});

module.exports = View;
