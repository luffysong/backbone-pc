var base = require('base-extend-backbone');
var LoginUserView = require('./loginUser.view');
var BaseView = base.View;

var View = BaseView.extend({
  el: '#topBar',
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
  }
});

module.exports = View;
