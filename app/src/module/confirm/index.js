/**
 * Created by AaronYuan on 3/14/16.
 * confirm 对话框
 *
 * 使用
 *
 var  uiConfirm = require('ui.confirm');
 uiConfirm.show({
            title: '消息',
            content: '您确定要结束直播吗',
            okFn: function () {
                console.log('ok');
            },
            cancelFn: function () {
                console.log('cancel');
            }
        });
 *
 */


var confirm = {};
var _ = require('underscore');

var setting = {
  title: '消息',
  content: '',
  okFn: null,
  cancelFn: null,
  okBtn: true,
  cancelBtn: true
};

confirm.init = function (ops) {
  var tpl = _.template(this.getHTML());
  var html = tpl(ops);
  this.remove();
  this.bindEvent(html, ops.okFn, ops.cancelFn);
};

confirm.remove = function () {
  var wrap = $('#UIConfigWrap');
  if (wrap && wrap.length >= 1) {
    wrap.remove();
  }
};

confirm.getHTML = function () {
  return require('./template/confirm.html');
};

confirm.bindEvent = function (html, okFn, cancelFn) {
  var self = this;
  var ele = $(html);

  ele.find('#UIConfirmOk').on('click', function (e) {
    e.preventDefault();
    if (okFn) {
      okFn();
    }
    self.remove();
    return false;
  });
  ele.find('.UIConfirmClose').on('click', function (e) {
    e.preventDefault();
    if (cancelFn) {
      cancelFn();
    }
    self.remove();
    return false;
  });

  $('body').append(ele);
};

/**
 *
 * @param options
 *  {
   *  title: ''
   *  content: ''
   *  okFn: fun
   *  cancelFn: fun
  *  }
 */
confirm.show = function (options) {
  var ops = _.extend(setting, options);
  this.init(ops);
};
confirm.close = function () {
  this.remove();
};


module.exports = {
  show: function (options) {
    confirm.show(options);
  },
  close: function () {
    confirm.close();
  }
};
