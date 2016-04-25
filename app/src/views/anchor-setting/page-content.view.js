'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var storage = base.storage;
var CreateLiveView = require('./create-live-video.view');
var NoOpenListView = require('./no-open-list.view');
var HistoryListView = require('./history-list.view');
var UIconfirm = require('ui.confirm');
var Auxiliary = require('auxiliary-additions');
var URL = Auxiliary.url;

var View = BaseView.extend({
  el: '#pageContent',
  events: { //  监听事件
    'click #tab-menu-ctrl>li': 'menuChanged',
    'click #liveState>li': 'liveStateChanged',
    'click #profileSate>li': 'profileStateChanged'
  },
  rawLoader: function () {
    return require('./template/page-content.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.noListDOM = this.findDOMNode('#noOpenListLive');
    this.historyDOM = this.findDOMNode('#historyListLive');
    this.liveStateDOMS = this.findDOMNode('#liveState>li');
    this.editProfileDOM = this.findDOMNode('#editProfile');
    this.accountSettingsDOM = this.findDOMNode('#accountSettings');
    this.profileStateDOMS = this.findDOMNode('#profileSate>li');
    this.updatePasswordDom = this.findDOMNode('#updatePassword');
  },
  ready: function () {
    //  初始化
    this.createLiveView = new CreateLiveView();
    this.noopenListView = new NoOpenListView();
    this.historyListView = new HistoryListView();
    var viewName = URL.parse(window.location.href).query.view || '';
    this.changeView(viewName);
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  /**
   * 切换菜单
   */
  menuChanged: function (e) {
    var target = $(e.target);
    if (e.target.tagName === 'SPAN') {
      target = target.parent();
    }
    if (target) {
      if (target.attr('data-panel') === 'signout') {
        UIconfirm.show({
          content: '是否退出',
          okFn: function () {
            storage.remove('imSig');
            // 跳转走人
            storage.set('signout', 1);
            window.location.href = '/web/login.html';
          }
        });
      } else {
        target.parent().children('li').removeClass('on');
        target.addClass('on');
        $('.tab-panel').hide();
        $('#' + target.attr('data-panel')).show();
      }
    }
  },
  /**
   * [liveStateChanged 直播历史与未直播]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  liveStateChanged: function (e) {
    var target = $(e.currentTarget);
    var state = target.data('state');
    this.liveStateDOMS.removeClass('on');
    target.addClass('on');
    if (~~state) {
      this.noListDOM.hide();
      this.historyDOM.show();
    } else {
      this.historyDOM.hide();
      this.noListDOM.show();
    }
  },
  /**
   * [profileStateChanged 个人设置]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  profileStateChanged: function (e) {
    var target = $(e.currentTarget);
    var state = target.data('state');
    this.profileStateDOMS.removeClass('on');
    target.addClass('on');
    if (~~state) {
      this.editProfileDOM.hide();
      this.updatePasswordDom.show();
    } else {
      this.editProfileDOM.show();
      this.updatePasswordDom.hide();
    }
  },
  changeView: function (view) {
    if (view === 'history') {
      this.liveStateChanged({
        currentTarget: $('.myLiveControls').find('[data-state="1"]')
      });
    }
  }
});

module.exports = View;
