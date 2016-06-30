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
var IMModel = require('IMModel');
var imModel = IMModel.sharedInstanceIMModel();
var RecordLiveView = require('./watch-record.view');
var FollowingView = require('./following.view');

var View = BaseView.extend({
  el: '#pageContent',
  events: { //  监听事件
    // 'click #tab-menu-ctrl>li': 'menuChanged',
    'click #liveState a': 'liveStateChanged',
    'click #profileSate>a': 'profileStateChanged'
  },
  rawLoader: function () {
    return require('./template/page-content.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.menuList = {
      list: []
    };
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.noListDOM = this.findDOMNode('#noOpenListLive');
    this.historyDOM = this.findDOMNode('#historyListLive');
    this.liveStateDOMS = this.findDOMNode('#liveState a');
    this.editProfileDOM = this.findDOMNode('#editProfile');
    this.accountSettingsDOM = this.findDOMNode('#accountSettings');
    this.profileStateDOMS = this.findDOMNode('#profileSate>a');
    this.updatePasswordDom = this.findDOMNode('#updatePassword');

    this.menuWrap = $('#tab-menu-ctrl');
    this.menuTpl = $('#menuTpl').text();
  },
  ready: function () {
    this.menuWrap.on('click', this.menuChanged.bind(this));
    this.initMenu();
    //  初始化
    if (imModel.isAnchor()) {
      this.noopenListView = new NoOpenListView();
      this.historyListView = new HistoryListView();
      this.createLiveView = new CreateLiveView();
    }
    this.followingView = new FollowingView();
    this.recordListView = new RecordLiveView();

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
    if (e.target.tagName === 'A') {
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
            window.location.href = '/login.html';
          }
        });
      } else {
        target.parent().children('li').removeClass('am-active');
        target.addClass('am-active');
        $('.tab-content').hide();
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
    this.liveStateDOMS.removeClass('active');
    target.addClass('active');
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
    this.profileStateDOMS.removeClass('active');
    target.addClass('active');
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
  },
  /**
   * 初始化菜单
   */
  initMenu: function () {
    if (imModel.isAnchor()) {
      this.menuList.list = [
        {
          name: '我的直播', pannel: 'tab-my-live', active: true
        },
        {
          name: '创建直播', pannel: 'createLiveVideo'
        },
        {
          name: '观看记录', pannel: 'recordList', active: true
        },
        {
          name: '我的关注', pannel: 'followingList'
        }
      ];
      this.menuList.list.push({
        name: '个人设置', pannel: 'tabSetting'
      });
    } else {
      this.menuList.list = [
        {
          name: '观看记录', pannel: 'recordList', active: true
        },
        {
          name: '我的关注', pannel: 'followingList'
        }
      ];
    }
    // this.menuList.list.push({
    //   name: '退出', pannel: 'signout'
    // });
    if (this.menuTpl) {
      var html = this.compileHTML(this.menuTpl, this.menuList);
      this.menuWrap.html(html);
      this.menuWrap.children(':first').click();
    }
  }
});

module.exports = View;
