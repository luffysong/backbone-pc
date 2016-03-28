/**
 * Created by AaronYuan on 3/14/16.
 * confirm 对话框
 *
 * 使用
 *
 var  uiConfirm = require('ui.Confirm');
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

var setting = {
    title: '消息',
    content: '',
    okFn: null,
    cancelFn: null,
    okBtn: true,
    cancelBtn: true
};

confirm.init = function (setting) {
    var tpl = _.template(this.getHTML());
    var html = tpl(setting);
    this.remove();
    this.bindEvent(html, setting.okFn, setting.cancelFn);

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
    var self  = this;
    html = $(html);
    html.find('#UIConfirmOk').on('click', function (e) {
        e.preventDefault();
        okFn && okFn();
        self.remove();
        return false;
    });
    html.find('.UIConfirmClose').on('click', function (e) {
        e.preventDefault();
        cancelFn && cancelFn();
        self.remove();
        return false;
    });
    html.find('#UIConfirmOk').on('click', function (e) {
        e.preventDefault();
        self.remove();
        return false;
    });

    $('body').append(html);
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


