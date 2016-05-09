/**
 *
 * Created by AaronYuan on 5/4/16.
 */


'use strict';

var base = require('base-extend-backbone');
var _ = require('underscore');
var BaseView = base.View; // View的基类
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var DateTime = require('BusinessDate');

var FollowingListModel = require('../../models/anchor-setting/following-list.model');
var UnFollowModel = require('../../models/anchor-setting/unfollow.model');
var AnchorLastestModel = require('../../models/anchor-setting/anchor-lastest.model');
var msgBox = require('ui.msgBox');

var View = BaseView.extend({
  el: '#followingList', // 设置View对象作用于的根元素，比如id
  rawLoader: function () { // 可用此方法返回字符串模版
    return require('./template/following.html');
  },
  events: { // 监听事件
    'click #followList': 'cancelClicked'
  },
  // 当模板挂载到元素之前
  beforeMount: function () {

  },
  // 当模板挂载到元素之后
  afterMount: function () {
    this.followListModel = FollowingListModel.sharedInstanceModel();
    this.unFollowModel = UnFollowModel.sharedInstanceModel();
    this.anchorLastestModel = AnchorLastestModel.sharedInstanceModel();

    this.followList = this.$el.find('#followList');

    this.params = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      size: 9,
      offset: 0
    };
    this.unFollowParams = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      anchorId: 0
    };

    this.followTpl = this.$el.find('#followTpl').text();
  },
  // 当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.initPagination();
  },
  initPagination: function () {
    var self = this;
    this.pageing = $('#followPageWrap').paging(1, {
      format: '[ < .(qq -) nnncnn (- pp)> ] ',
      perpage: 9,
      page: 1,
      onFormat: function (type) {
        switch (type) {
          case 'block':
            if (!this.active) {
              return '<span class="disabled ">' + this.value + '</span>';
            } else if (this.value !== this.page) {
              return '<a href="#' + this.value + '">' + this.value + '</a>';
            }
            return '<span class="current ">' + this.value + '</span>';
          case 'next':
            if (this.active) {
              return '<a href="#' + this.value + '" class="next ">&raquo;</a>';
            }
            return '<span class="disabled ">&raquo;</span>';
          case 'prev':
            if (this.active) {
              return '<a href="#' + this.value + '" class="prev ">&laquo;</a>';
            }
            return '<span class="disabled ">&laquo;</span>';
          case 'fill':
            if (this.active) {
              return '<span>...</span>';
            }
            return '';
          default:
            return '';
        }
      },
      onSelect: function (page) {
        self.getPageList(page);
      }
    });
  },
  getPageList: function (page) {
    var self = this;
    this.params.offset = (page - 1) * 9;
    var promise = self.followListModel.executeJSONP(this.params);
    promise.done(function (res) {
      self.renderList(res);
      if (!self.totalCount && res.data.totalCount) {
        self.totalCount = res.data.totalCount;
        self.pageing.setNumber(self.totalCount);
        self.pageing.setPage();
      }
    });
    promise.fail(function () {
      // self.pageing.setNumber(1);
      // self.pageing.setPage();
    });
  },
  renderList: function (data) {
    var html = this.compileHTML(this.followTpl, data);
    this.followList.html(html);
  },
  formatData: function (data) {
    if (data) {
      _.each(data.data, function (item) {
        var curItem = item;
        var time = new Date(item.startTime);
        curItem.startTimeTxt = DateTime.format(time, 'yyyy/MM/dd');
        var result = DateTime.difference(item.duration);
        curItem.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
      });
    }
    return data;
  },
  cancelClicked: function (e) {
    var self = this;
    var target = $(e.target);
    var promise;
    var promise2;
    var url;
    if (target.data('id')) {
      this.unFollowParams.anchorId = target.data('id');
      promise = this.unFollowModel.executeJSONP(this.unFollowParams);
      promise.done(function (res) {
        if (res.code === '0') {
          msgBox.showOK('已取消关注');
          self.getPageList();
        } else {
          msgBox.showTip('取消关注失败,稍后重试');
        }
      });
      promise.fail(function () {
        msgBox.showTip('取消关注失败,稍后重试');
      });
    } else if (target.data('uid')) {
      this.unFollowParams.anchor = target.data('uid');
      promise2 = this.anchorLastestModel.executeJSONP(this.unFollowParams);
      promise2.done(function (res) {
        if (res && res.data && res.data.status) {
          if (res.data.status >= 2) {
            url = res.data.status === 2
              ? 'liveroom.html?roomId=' : 'playback.html?roomId=';
            window.location.href = url + res.data.id;
          }
        }
      });
    }
  }
});

module.exports = View;
