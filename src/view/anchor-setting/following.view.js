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
var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();

var FollowingListModel = require('../../model/anchor-setting/following-list.model');
var UnFollowModel = require('../../model/anchor-setting/unfollow.model');
var AnchorLastestModel = require('../../model/anchor-setting/anchor-lastest.model');
var msgBox = require('ui.MsgBox');

var View = BaseView.extend({
  el: '#followingList', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return require('../../template/anchor-setting/following.html');
  },
  events: { //监听事件
    'click #followList': 'cancelClicked'
    //'click #followList': ''
  },
  //当模板挂载到元素之前
  beforeMount: function () {

  },
  //当模板挂载到元素之后
  afterMount: function () {
    this.followListModel = FollowingListModel.sigleInstance();
    this.unFollowModel = UnFollowModel.sigleInstance();
    this.anchorLastestModel = AnchorLastestModel.sigleInstance();

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
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
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
            if (!this.active)
              return '<span class="disabled ">' + this.value + '</span>';
            else if (this.value != this.page)
              return '<a href="#' + this.value + '">' + this.value + '</a>';
            return '<span class="current ">' + this.value + '</span>';
          case 'next':
            if (this.active) {
              return '<a href="#' + this.value + '" class="next ">&gt;</a>';
            }
            return '<span class="disabled ">&gt;</span>';
          case 'prev':
            if (this.active) {
              return '<a href="#' + this.value + '" class="prev ">&lt;</a>';
            }
            return '<span class="disabled ">&lt;</span>';
          case 'fill':
            if (this.active) {
              return "<span>...</span>";
            }
            return '';
        }
        return ""; // return nothing for missing branches
      },
      onSelect: function (page) {
        self.getPageList(page);
      }
    });
  },
  getPageList: function (page) {
    var self = this;
    this.params.offset = (page - 1) * 9;
    self.followListModel.executeJSONP(this.params, function (res) {
      self.renderList(res);
      if (!self.totalCount && res.data.totalCount) {
        self.totalCount = res.data.totalCount;
        self.pageing.setNumber(self.totalCount);
        self.pageing.setPage();
      }
    }, function () {
      self.pageing.setNumber(1);
      self.pageing.setPage();
    });
  },
  renderList: function (data) {
    var html = this.compileHTML(this.followTpl, data);
    this.followList.html(html);
  },
  formatData: function (data) {
    if (data) {
      _.each(data.data, function (item) {
        var time = new Date(item.startTime);
        item.startTimeTxt = time.Format('yyyy/MM/dd');
        var result = DateTime.difference(item.duration);
        item.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
      });
    }
    return data;
  },
  cancelClicked: function (e) {
    var self = this;
    if ($(e.target).data('id')) {
      this.unFollowParams.anchorId = $(e.target).data('id');
      this.unFollowModel.executeJSONP(this.unFollowParams, function (res) {
        if (res.code == 0) {
          msgBox.showOK('已取消关注');
          //self.pageing.setPage(1);
          self.getPageList();
        } else {
          msgBox.showTip('取消关注失败,稍后重试');
        }
      }, function () {
        msgBox.showTip('取消关注失败,稍后重试');
      });
    } else if ($(e.target).data('uid')) {
      this.unFollowParams.anchor = $(e.target).data('uid');
      this.anchorLastestModel.executeJSONP(this.unFollowParams, function (res) {
        console.log(res);
        if (res && res.data && res.data.status) {
          if(res.data.status >=2){
            var url = res.data.status == 2? '/web/liveroom.html?roomId=': '/web/playback.html?roomId=';
            window.location.href = url + res.data.id;
          }
        }
      });

    }
  }

});

module.exports = View;