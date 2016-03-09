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
var cookie = require('cookie');
var LoginBox = require('LoginBox');
var View = BaseView.extend({
  el: '#topBar', //设置View对象作用于的根元素，比如id
  rawLoader: function () { //可用此方法返回字符串模版
    return '';
  },
  events: { //监听事件
    'click #login': 'loginHandler',
    'click .show-drop-menu': 'showDropMenu'
  },
  //当模板挂载到元素之前
  beforeMount: function () {

  },
  //当模板挂载到元素之后
  afterMount: function () {
    console.log(cookie.get('token'));
  },
  //当事件监听器，内部实例初始化完成，模板挂载到文档之后
  ready: function () {
    this.loginBox = LoginBox();
    this._dialog = this.loginBox.dialog;

    this.showDropMenuEle = $('.PcMsg .pcNav');

    this.hideDropMenu();
  },
  loginHandler: function (e) {
    e.preventDefault();
    var status = this._dialog.status();
    if (status === 'hide') {
      this._dialog.trigger('show');
    } else {
      this._dialog.trigger('hide');
    }
  },
  /**
   * 显示下拉菜单
   */
  showDropMenu: function (e) {
    e.preventDefault();
    console.log(123);
    this.showDropMenuEle.toggle();
    return false;
  },
  /**
   * 隐藏下拉菜单
   */
  hideDropMenu: function () {
    var self = this;
    $(document).on('click', function () {
      self.showDropMenuEle.hide();
    });
  }
});

module.exports = View;