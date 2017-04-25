'use strict';

var base = require('base-extend-backbone');
var BaseView = base.View;
var Auxiliary = require('auxiliary-additions');
var msgBox = require('ui.msgBox');
var AjaxForm = Auxiliary.AjaxForm;
var url = Auxiliary.url;
var View = BaseView.extend({
  el: '#updatePassword',
  events: { //  监听事件
    'click #btnPwdSave': 'updatePwd',
    'keyup #txtConfirmPwd': 'changeBtnStatus',
    'keyup #txtNewPwd': 'checkNewPwd'
  },
  rawLoader: function () {
    return require('./template/updatePassword.html');
  },
  context: function (args) {
    console.log(args);
  },
  beforeMount: function () {
    //  初始化一些自定义属性
  },
  afterMount: function () {
    //  获取findDOMNode DOM Node
    this.txtOldPwd = this.findDOMNode('#txtOldPwd');
    this.txtNewPwd = this.findDOMNode('#txtNewPwd');
    this.txtConfirmPwd = this.findDOMNode('#txtConfirmPwd');
    this.btnPwdSave = this.findDOMNode('#btnPwdSave');
    this.tipPwdErr = this.findDOMNode('#tipPwdErr');
    this.formPwd = this.findDOMNode('#formPwd');
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
  //  校验表单
  verifyForm: function () {
    var old = this.txtOldPwd.val();
    if (!old || old.length <= 0) {
      msgBox.showTip('请输入您当前的密码');
      return false;
    }
    var newPwd = this.txtNewPwd.val();
    var pwdReg = /[\S]{4,20}/; // /[a-zA-Z00-9]{6,18}/g;
    if (!newPwd || newPwd.length <= 0) {
      msgBox.showTip('请输入新的密码');
      return false;
    } else if (newPwd === old) {
      msgBox.showTip('新密码不能跟旧密码一致');
      return false;
    } else if (!pwdReg.test(newPwd)) {
      msgBox.showTip('密码的长度建议4~20位,允许输入字母、数字、符号');
      return false;
    }
    var confirmPwd = this.txtConfirmPwd.val();
    if (newPwd !== confirmPwd) {
      msgBox.showTip('2次输入的新密码不一致!');
      return false;
    }
    return true;
  },
  changeBtnStatus: function () {
    var newPwd = this.txtNewPwd.val();
    var confirmPwd = this.txtConfirmPwd.val();
    if (newPwd !== confirmPwd) {
      this.btnPwdSave.addClass('m_disabled');
    } else {
      this.btnPwdSave.removeClass('m_disabled');
    }
  },
  updatePwd: function () {
    var self = this;
    if (!self.verifyForm()) {
      return false;
    }
    this.btnPwdSave.text('保存中');
    this.initAjaxForm();
    this.formPwd.submit();
    return true;
  },
  checkNewPwd: function () {
    var old = this.txtOldPwd.val();
    var newPwd = this.txtNewPwd.val();
    if (old === newPwd) {
      this.tipPwdErr.show();
    } else {
      this.tipPwdErr.hide();
    }
  },
  //  重置表单
  resetInput: function () {
    this.formPwd.find('input').val('');
  },
  initAjaxForm: function () {
    var self = this;
    this.pwdAjaxForm = AjaxForm.classInstanceAjaxForm($('#formPwd'));
    this.pwdAjaxForm.setIframeState(true);
    this.pwdAjaxForm.done(function (cw) {
      var loc = cw.location;
      var search = decodeURIComponent(loc.search);
      var response = url.parseSearch(search);
      response = response.json;
      if (response && response.error === true) {
        msgBox.showError(response.message);
      } else {
        self.resetInput();
        msgBox.showOK('密码修改成功!');
      }
      self.btnPwdSave.text('保存');
    });
    this.pwdAjaxForm.fail(function () {
      msgBox.showError('密码修改失败!');
      self.btnPwdSave.text('保存');
    });
  }
});

module.exports = View;
