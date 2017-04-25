/**
 * 历史直播
 */
'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var HistoryListModel = require('../../models/anchor-setting/history-list.model');
// var NoOpenPageBoxView = require('./page-box.view');
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var easyImage = require('../../../images/easy.png');
var yunImage = require('../../../images/yun.png');
var loveImage = require('../../../images/love.png');
var Pagenation = require('Pagenation');

var View = BaseView.extend({
  el: '#historyContent',
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    var token = user.getToken();
    this.listTemp = require('./template/history-list.html');
    this.historyParameter = {
      deviceinfo: '{"aid":"30001001"}',
      order: 'time',
      offset: 0,
      size: 6,
      access_token: 'web-' + token
    };
    this.historyModel = new HistoryListModel();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    // var self = this;
    // var promise = this.historyModel.executeJSONP(this.historyParameter);
    // promise.done(function (response) {
    //   var data = response.data;
    //   var roomList = data.roomList || [];
    //   var count = Math.ceil(data.totalCount / self.historyParameter.size);
    //   if (count > 1) {
    //     self.initPageBox({
    //       offset: self.historyParameter.offset,
    //       size: self.historyParameter.size,
    //       count: count
    //     });
    //   }
    //   self.initRender(roomList);
    // });
    // promise.fail(function () {});
    this.getPageList(1);
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  getPageList: function (page) {
    var self = this;
    this.historyParameter = $.extend(this.historyParameter, {
      offset: this.historyParameter.size * (page - 1)
    });
    var promise = this.historyModel.executeJSONP(this.historyParameter);
    promise.done(function (response) {
      var data = response.data;
      var roomList = data.roomList || [];
      // var count = Math.ceil(data.totalCount / self.historyParameter.size);
      // if (count > 1) {
      //   self.initPageBox({
      //     offset: self.historyParameter.offset,
      //     size: self.historyParameter.size,
      //     count: count
      //   });
      // }
      if (!self.totalCount && data.totalCount) {
        self.totalCount = data.totalCount;
        self.initPageBox(data.totalCount);
      }
      self.initRender(roomList);
    });
    promise.fail(function () {});
  },
  initPageBox: function (total) {
    var self = this;
    this.pagingBox = Pagenation.create('#historyPageBox', {
      total: total || 1,
      perpage: self.historyParameter.size,
      onSelect: function (page) {
        self.getPageList(page);
      }
    });
    // this.pageBoxView = new NoOpenPageBoxView({
    //   el: '#historyPageBox',
    //   props: prop,
    //   listModel: this.historyModel,
    //   listRender: function (response) {
    //     var data = response.data;
    //     var roomList = data.roomList;
    //     self.initRender(roomList);
    //   }
    // });
  },
  initRender: function (items) {
    var html = '';
    if (items.length) {
      html = this.compileHTML(this.listTemp, {
        items: items,
        easyImage: easyImage,
        yunImage: yunImage,
        loveImage: loveImage
      });
    } else {
      html = '<h1>暂无数据</h1>';
    }
    this.$el.html(html);
  }
});

module.exports = View;
