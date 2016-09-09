var base = require('base-extend-backbone');
var LoginUserView = require('./loginUser.view');
var BaseView = base.View;
var Auxiliary = require('auxiliary-additions');
var URL = Auxiliary.url;

var View = BaseView.extend({
  el: '#topBar',
  events: {
    'click #index': 'goRedirect',
    'click #all': 'goRedirect'
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
    this.loginUser = new LoginUserView();
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
  },
  ready: function () {
    //  初始化
    var _this = this;
    this.loginUser.on('topbar-logined', function () {
      _this.trigger('logined');
    });
    var url = URL.parse(location.href);
    this.host = url.host;
    $('#all').parent().children().removeClass('acive_btn');
    if (url.href.indexOf('channellist') > 0) {
      $('#all').addClass('acive_btn');
    } else if (url.href.indexOf('roomId') > 0
    || url.href.indexOf('channelId') > 0
    || url.href.indexOf('anchor-setting') > 0) {
      $('#all').parent().children().removeClass('acive_btn');
    } else {
      $('#index').addClass('acive_btn');
    }
  },
  beforeDestroy: function () {
    //  进入销毁之前,将引用关系设置为null
  },
  destroyed: function () {
    //  销毁之后
  },
  showLoginDialog: function () {
    this.loginUser.showDialog();
  },
  hideLoginDialog: function () {
    this.loginUser.hideDialog();
  },
  goRedirect: function (e) {
    var target = $(e.target);
    var id = target.attr('id');
    if (id === 'index') {
      window.location.href = 'http://' + this.host + '/';
    } else {
      window.location.href = 'http://' + this.host + '/channellist.html';
    }
  }
});

module.exports = View;
