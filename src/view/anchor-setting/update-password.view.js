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
var UpdatePwdModel = require('../../model/anchor-setting/update-password.model');
var AjaxForm = require('AjaxForm');
var msgBox = require('ui.MsgBox');
var url =  require('url');


var View = BaseView.extend({
    el: '#updatePassword', //设置View对象作用于的根元素，比如id
    rawLoader: function () { //可用此方法返回字符串模版
        return require('../../template/anchor-setting/updatePassword.html');
    },
    events: { //监听事件
        'click #btnPwdSave': 'updatePwd',
        'keyup #txtConfirmPwd': 'changeBtnStatus'
    },
    //当模板挂载到元素之前
    beforeMount: function () {
        this.updatePwdModel = new UpdatePwdModel();
    },
    //当模板挂载到元素之后
    afterMount: function () {
        var el = this.$el;
        this.txtOldPwd = el.find('#txtOldPwd');
        this.txtNewPwd = el.find('#txtNewPwd');
        this.txtConfirmPwd = el.find('#txtConfirmPwd');
        this.btnPwdSave = el.find('#btnPwdSave');

        this.formPwd = el.find('#formPwd');

    },
    //当事件监听器，内部实例初始化完成，模板挂载到文档之后
    ready: function () {
        this.initAjaxForm();
    },
    //校验表单
    verifyForm: function () {
        var old = this.txtOldPwd.val();
        if (!old || old.length <= 0) {
            msgBox.showTip('请输入您当前的密码');
            return false;
        }

        var newPwd = this.txtNewPwd.val(),
            pwdReg = /[\S]{6,18}/; ///[a-zA-Z00-9]{6,18}/g;
        if (!newPwd || newPwd.length <= 0) {
            msgBox.showTip('请输入新的密码');
            return false;
        }else if(newPwd == old){
            msgBox.showTip('新密码不能跟旧密码一致');
            return false;
        } else if (!pwdReg.test(newPwd)) {
            msgBox.showTip('密码的长度建议6~18位,允许输入字母、数字、符号');
            return false;
        }

        var confirmPwd = this.txtConfirmPwd.val();
        if (newPwd != confirmPwd) {
            msgBox.showTip('2次输入的新密码不一致!');
            return false;
        }

        return true;
    },
    changeBtnStatus: function () {
        var newPwd = this.txtNewPwd.val(),
            confirmPwd = this.txtConfirmPwd.val();
        if (newPwd != confirmPwd) {
            this.btnPwdSave.addClass('m_disabled');
        } else {
            this.btnPwdSave.removeClass('m_disabled');
        }
    },
    updatePwd: function () {
        var self = this;

        if (!self.verifyForm()) {
            return null;
        }

        this.formPwd.submit();
    },
    //重置表单
    resetInput: function () {
        $('form').find('input').val('');

    },
    initAjaxForm: function () {
        var self = this;
        this.pwdAjaxForm = AjaxForm.classInstanceAjaxForm($('#formPwd'), {
            success: function (res) {
                var cw = this.contentWindow;
                var loc = cw.location;
                var search = decodeURIComponent(cw.location.search);
                var response = url.parseSearch(search);
                response = response.json;
                console.log(response);
                if(response && response.error == true){
                    msgBox.showError(response.message);
                }else{
                    self.resetInput();
                    msgBox.showOK('密码修改成功!');
                }
            },
            failure: function (err) {
                console.log(err);
                msgBox.showError('密码修改失败!');
            }
        });
        this.pwdAjaxForm.setIframeState(true);
    }

});

module.exports = View;
