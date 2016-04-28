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
var CreateLiveView = require('./create-live-video.view');
var NoOpenListView = require('./no-open-list.view');
var HistoryListView = require('./history-list.view');
var RecordLiveView = require('./watch-record.view');
var FollowingView = require('./following.view');
var UIConfirm = require('ui.Confirm');
var store = require('store');
var URL = require('url');
var IMModel = require('../../lib/IMModel');
var imModel = IMModel.sharedInstanceIMModel();


var View = BaseView.extend({
  el: '#pageContent', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return require('../../template/anchor-setting/page-content.html');
  },
  events: { //监听事件
    'click #tab-menu-ctrl>li': 'menuChanged',
    'click #liveState>li': 'liveStateChanged',
    'click #profileSate>li': 'profileStateChanged'
  },
  //当模板挂载到元素之前
  beforeMount: function () {
    this.menuList = {
      list: []
    };

    this.initMenu();
  },
  //当模板挂载到元素之后
  afterMount: function () {
    this.noListDOM = this.$el.find('#noOpenListLive');
    this.historyDOM = this.$el.find('#historyListLive');
    this.liveStateDOMS = this.$el.find('#liveState>li');
    this.editProfileDOM = this.$el.find('#editProfile');
    this.accountSettingsDOM = this.$el.find('#accountSettings');
    this.profileStateDOMS = this.$el.find('#profileSate>li');
    this.updatePasswordDom = this.$el.find('#updatePassword');

    this.menuWrap = this.$el.find('#tab-menu-ctrl');
    this.menuTpl = this.$el.find('#menuTpl').text();

  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.initMenu();

    if (!imModel.isAnchor()) {
      this.recordListView = new RecordLiveView();
    }else{
      this.noopenListView = new NoOpenListView();
      this.historyListView = new HistoryListView();
      this.createLiveView = new CreateLiveView();
    }
    this.followingView = new FollowingView();


    var viewName = URL.parse(window.location.href).query.view || '';
    this.changeView(viewName);
    //console.log(this.view);
  },
  /**
   * 切换菜单
   */
  menuChanged: function (e) {
    var target = $(e.target);
    if (e.target.tagName == 'SPAN') {
      target = target.parent();
    }
    if (target) {
      if (target.attr('data-panel') === 'signout') {
        UIConfirm.show({
          content: '是否退出',
          okFn: function () {
            store.remove('imSig');
            //跳转走人
            store.set('signout', 1);
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
    ;
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
      //this.accountSettingsDOM.show();
      this.updatePasswordDom.show();
    } else {
      //this.accountSettingsDOM.hide();
      this.editProfileDOM.show();
      this.updatePasswordDom.hide();
    }
  },
  changeView: function (view) {
    if (view == 'history') {
      this.liveStateChanged({
        currentTarget: $('.myLiveControls').find('[data-state="1"]')
      })
    }
  },
  /**
   * 初始化菜单
   */
  initMenu: function () {
    if (imModel.isAnchor()) {
      this.menuList.list = [
        {name: '我的直播', pannel: 'tab-my-live', active: true},
        {name: '创建直播', pannel: 'createLiveVideo'},
        {name: '我的关注', pannel: 'followingList'}
      ];
      this.menuList.list.push({name: '个人设置', pannel: 'tabSetting'});
    } else {
      this.menuList.list = [
        {name: '观看记录', pannel: 'recordList', active: true},
        {name: '我的关注', pannel: 'followingList'}
      ];
    }
    this.menuList.list.push({name: '退出', pannel: 'signout'});
    if (this.menuTpl) {
      var html = this.compileHTML(this.menuTpl, this.menuList);
      this.menuWrap.html(html);
      this.menuWrap.children(':first').click();
    }
  }
});

module.exports = View;
