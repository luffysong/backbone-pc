/*
 clientRender:{bool} //默认设置为false，如果为true，内部将不会调用rawLoader方法或者根据templateUrl请求模版
 */


/**
 * @time {时间}
 * @author {编写者}
 * @info 用户观看记录
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var DateTime = require('DateTime');

var UserModel = require('UserModel');
var user = UserModel.sharedInstanceUserModel();
var WatchRecordModel = require('../../model/anchor-setting/watch-record.model');

var View = BaseView.extend({
  el: '#recordList', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return require('../../template/anchor-setting/record-list.html');
  },
  events: { //监听事件

  },
  //当模板挂载到元素之前
  beforeMount: function () {
    this.watchRecordModel = WatchRecordModel.sigleInstance();

    this.params = {
      deviceinfo: '{"aid": "30001001"}',
      access_token: user.getWebToken(),
      size: 6,
      offset: 0
    };
  },
  //当模板挂载到元素之后
  afterMount: function () {
    this.recordTpl = this.$el.find('#recordTpl').text();

    this.recordList = this.$el.find('#recordList');
  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    //this.getPageList(1);
    this.initPagination();
  },
  initPagination: function (total) {
    var self = this;
    this.pageing = $('#page-wrap').paging(total || 1, {
      format: '[ < .(qq -) nnncnn (- pp)> ] ',
      perpage: 6,
      //page: 1,
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
    this.params.offset = (page - 1) * 6;
    self.watchRecordModel.executeJSONP(this.params, function (res) {
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
    var result = this.formatData(data);
    var html = this.compileHTML(this.recordTpl, result);
    this.recordList.html(html);
  },
  formatData: function (data) {
    if (data) {
      _.each(data.data.rooms, function (item) {
        if (item.startTime) {
          var time = new Date(item.startTime);
          item.startTimeTxt = time.Format('yyyy/MM/dd');
        }
        var result = DateTime.difference(item.duration);
        item.durationTxt = result.hours + ':' + result.minutes + ':' + result.seconds;
      });
    }
    return data;
  }
});


module.exports = View;