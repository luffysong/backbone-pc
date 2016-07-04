'use strict';

var Backbone = window.Backbone;
var base = require('base-extend-backbone');
var BaseView = base.View;
var navTemp =
  '{{each items as item i}}'
  + '<span class="{{if item == num }}now{{/if}}" data-page="{{item}}"'
  + 'data-indice="{{i}}">{{item}}</span>'
  + '{{/each}}';
var UserModel = require('UserModel');
var msgBox = require('ui.msgBox');
var user = UserModel.sharedInstanceUserModel();
var View = BaseView.extend({
  events: { //  监听事件
    'click .pre': 'preHandler',
    'click .next': 'nextHandler',
    'click #nav span': 'pageboxHandler'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    var props = this._ICEOptions.props;
    this.boxTemp = require('./template/pagebox.html');
    this.count = props.count;
    this.offset = props.offset || 0;
    this.size = props.size;
    this.sectionBase = props.sectionBase || 3;
    this.listModel = this._ICEOptions.listModel;
    this.listRender = this._ICEOptions.listRender;
    this.modelParameter = {
      deviceinfo: '{"aid":"30001001"}',
      order: '',
      offset: 0,
      size: this.size,
      access_token: 'web-' + user.getToken()
    };
    this.omit = this.count > 2;
    this.items = [];
    var i = 0;
    for (; i < this.count; i++) {
      this.items.push(i + 1);
    }
    this.lock = true;
    this.translation = 0;
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this._ICEinitEvent();
    this.initRender();
    this.pageChanged();
    this.initEvent();
  },
  ready: function () {
    //  初始化
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  initRender: function () {
    var temp = this.items.concat();
    if (this.omit) {
      temp = temp.splice(0, 3);
    }
    var data = {
      count: this.count,
      omit: this.omit,
      items: temp,
      preOmit: this.preOmit
    };
    var html = this.compileHTML(this.boxTemp, data);
    this.$el.html(html);
    this.howPage = this.$el.find('#howPage');
    this.nav = this.$el.find('#nav');

    this.tipPreOmit = this.$el.find('#tipPreOmit');
    this.tipOmit = this.$el.find('#tipOmit');
  },
  preHandler: function (e) {
    var target = $(e.currentTarget);
    if (this.offset <= 0) {
      msgBox.showTip('原因：已经翻到最前一页');
      return;
    }
    var state = target.attr('data-state');
    this.initRequest(state);
  },
  nextHandler: function (e) {
    var target = $(e.currentTarget);
    if (this.offset === this.count - 1) {
      msgBox.showTip('原因：已经翻到最后一页');
      return;
    }
    var state = target.attr('data-state');
    this.initRequest(state);
  },
  pageboxHandler: function (e) {
    var el = $(e.currentTarget);
    if (!el.attr('data-page')) {
      return;
    }
    var page = ~~el.attr('data-page');
    if ((page - 1) === this.offset) {
      return;
    }
    var spans = this.nav.find('span');
    spans.removeClass('now');
    el.addClass('now');
    var num = ~~el.text();
    this.offset = num - 1;
    this.translation = ~~el.attr('data-indice');
    this.openRequest();
  },
  initRequest: function (state) {
    switch (state) {
      case '1':
        if (this.offset !== 0) {
          this.offset--;
          this.sectionLogic(0);
        }
        break;
      case '2':
        if (this.offset <= (this.count - 2)) {
          this.offset++;
          this.sectionLogic(1);
        }
        break;
      default:
    }
    this.openRequest();
  },
  openRequest: function () {
    var self = this;
    if (this.lock) {
      this.lock = false;
      this.modelParameter.offset = (this.offset || 0) * this.size;
      var promise = this.listModel.executeJSONP(this.modelParameter);
      promise.done(function (response) {
        self.lock = true;
        var code = ~~response.code;
        if (code) {
          msgBox.showError(response.msg);
          return;
        }
        self.listRender(response);
      });
      promise.fail(function () {
        self.lock = true;
        if (self.offset !== 0) {
          self.offset--;
        }
      });
    }
  },
  sectionLogic: function (state) {
    var _base = this.sectionBase - 1;
    var boundary = this.offset + (_base);
    var temp = this.items.concat();
    var middle = temp[boundary];
    if (middle <= temp[temp.length - 1]) {
      this.translation = 0;
      temp = temp.splice(this.offset, this.sectionBase);
      this.sectionRender(temp, temp[0]);
    } else {
      if (!middle) {
        //  如果中间值未存在
        var start = this.offset ? this.offset - 1 : this.offset; // 重新计算起始位置
        if (this.offset > (this.count - 2)) {
          //  已经到最后一位了
          if (start) {
            --start;
          }
        }
        var middleTemp = temp.splice(start, this.sectionBase);
        this.translation = 0;
        //  并且迁移一位
        this.sectionRender(middleTemp, this.offset + 1);
        return;
      }
      if (this.translation > base) {
        return;
      }
      if (state) {
        //  true ++
        this.translation++;
      } else {
        //  false --
        this.translation--;
      }
      this.spans.removeClass('now');
      var span = this.spans[this.translation];
      $(span).addClass('now');
    }
  },
  sectionRender: function (items, state) {
    var html = this.compileHTML(navTemp, {
      items: items,
      num: state,
      preOmit: this.preOmit,
      omit: this.omit
    });
    this.nav.html(html);
    this.spans = this.nav.find('span');
    Backbone.trigger(this.cid + 'event:listPageChanged');
  },
  //  ``分页变化时
  pageChanged: function () {
    var self = this;
    if (self.offset > 2) {
      this.tipPreOmit.show();
    } else {
      this.tipPreOmit.hide();
    }
    if (self.count < 4 || (self.offset + 3) >= self.count) {
      this.tipOmit.hide();
    } else {
      this.tipOmit.show();
    }
  },
  initEvent: function () {
    var self = this;
    Backbone.on(this.cid + 'event:listPageChanged', function (context) {
      self.pageChanged(context);
    });
  }
});

module.exports = View;
