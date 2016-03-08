/**
 * @time {时间}
 * @author {编写者}
 * @info {实现的功能}
 */

'use strict';

var BaseView = require('BaseView'); //View的基类
var Dialog = require('ui.Dialog'); //Diglog类
var AjaxForm = require('AjaxForm');
var UserModel = require('UserModel');
var pwdencrypt = require('pwdencrypt');
var loginBoxTemp = require('./template/loginBox.html');
var tplEng = require('tplEng');
var secret = require('secret');
//邮件
var EMAIL_PATTERN = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//数字
var NUMBER_PATTERN = /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/;
/*标记是否极验验证通过*/
var isGeetest = false;
var Geetest;
var errorinfo;
var email;
var password;
var loginBoxForm;
var ajaxForm;
var requrest = true;

//验证成功
window.gt_custom_ajax = function (result, selector) {
	if (result) {
		isGeetest = true;
		var errorinfo = loginBoxForm.find('.errorinfo');
		if(errorinfo.html() == "拖动滑块完成验证"){
			errorinfo.css('visibility', 'hidden');
		}
	}
};

function _initForm(){
	errorinfo = loginBoxForm.find('.errorinfo');
	email = loginBoxForm.find('[name=email]');
	password = loginBoxForm.find('.pwd');
	_setFocusEffect(email);
	_setFocusEffect(password);
	ajaxForm = AjaxForm.classInstanceAjaxForm(loginBoxForm,{
		success:function(response){
			console.log(response);
			if (!response.error) {
				if (response.platFormRef) {
					location.href = 'http://login.yinyuetai.com/platform';
				} else {
					//user.set(data);
					loginBox.trigger('hide');
				}
			} else {
				errorinfo.text(response.message).css('visibility', 'visible');
				refreshGeetest();
			}
		},
		failure:function(){

		}
	});
};

function _setFocusEffect(input){
	if (input.attr('name') === 'email') {
		input.focus(function() {
			$(this).parent().addClass('emailfocus').removeClass('emailerror');
		});
		input.blur(function() {
			$(this).parent().removeClass('emailfocus');
		});
	} else {
		input.focus(function() {
			$(this).parent().addClass('focus').removeClass('error');
		});
		input.blur(function() {
			$(this).parent().removeClass('focus');
		});
	};
};

function cryptoParam (){
	return [$.trim(email.val()) + $.trim(password.val())];
};

function loginSubmit(e){
	e.preventDefault();
	var _crytoP = cryptoParam();
	ajaxForm.encrypto(secret.apply(window,_crytoP));
	if (isPassTest()) {
		ajaxForm.setIframeState(true);
		this.submit();
	}
};

function refreshGeetest (){
	Geetest.refresh();
	isGeetest = false;
};

function validator (){
	var emailVal = $.trim(email.val());
	var passwordVal = $.trim(password.val());
	if (emailVal.length === 0) {
		errorinfo.text('邮箱或手机不能为空').css('visibility', 'visible');
		email.parent().addClass('emailerror');
		return false;
	}
	if (!EMAIL_PATTERN.test(emailVal)) {
		if (NUMBER_PATTERN.test(emailVal)) {
			if (emailVal.length !== 11) {
				errorinfo.text('请输入正确的电子邮箱或手机').css('visibility', 'visible');
				email.parent().addClass('emailerror');
				return false;
			}
		} else {
			errorinfo.text('请输入正确的电子邮箱或手机').css('visibility', 'visible');
			email.parent().addClass('emailerror');
			return false;
		}
	}
	if (passwordVal.length === 0) {
		errorinfo.text('密码不能为空').css('visibility', 'visible');
		password.parent().addClass('error');
		return false;
	}
	if (passwordVal.length < 4 || passwordVal.length > 20) {
		errorinfo.text('密码长度必须大于4且小于20').css('visibility', 'visible');
		password.parent().addClass('error');
		return false;
	}
	return true;
};

function isPassTest (){
	if (!validator()) {
		refreshGeetest();
		return false;
	}
	if(!isGeetest){
		var  errorText = "拖动滑块完成验证";
		errorinfo.text(errorText).css('visibility', 'visible');
		return false;
	}
	if (loginBoxForm.find('[name=encpsw]').length != 0) {
		loginBoxForm.find('[name=encpsw]').val(pwdencrypt(password.val()));
	} else {
		$('<input />').attr({
			type : 'hidden',
			name : 'encpsw',
			value : pwdencrypt(password.val())
		}).appendTo(loginBoxForm);
	}
	return true;
};

function compileHTML(tplStr,data){
	return tplEng.compile(tplStr)(data);
};

module.exports = function(){
	var dialogHTML = compileHTML(loginBoxTemp,{
		"url":"http://login.yinyuetai.com"
	});
	var dialog = Dialog.classInstanceDialog(dialogHTML,{
		width : 691,
		height : 342,
		isRemoveAfterHide : false,
		isAutoShow : false
	});
	loginBoxForm = dialog.$el.find('#loginBoxForm');
	dialog.on('show',function(){
		if(!Geetest){
			/*添加验证框*/
			Geetest = new window.Geetest({
				"gt":"cc34bd7df5c42f7d9c3f540fdfb671cf",
				"product":"float"
			})
			Geetest.appendTo("#captcha");
		}
		_initForm();
		//UA_Opt.reload();
		$.getJSON('http://www.yinyuetai.com/partner/get-partner-code?placeIds=reg_window&callback=?', function(data){
			if(data && data.reg_window){
				self.dialog.$el.find('.loginbox-placehold').html(data.reg_window);
			}
		});
	});
	dialog.on('hide',function(){
		var form = dialog.$el.find('form');
		form.find('.errorinfo').css('visibility', 'hidden');
		form.find('[name=email],[name=password]').parent().removeClass('emailerror').removeClass('error');
		//去掉悦单播放页面中下载悦单的active效果
		$('.J_pop_download').removeClass('v_button_curv');
		setTimeout(function(){
			refreshGeetest();
		},500);
	});
	loginBoxForm.on('submit',loginSubmit);
	return {
		"dialog":dialog
	}
}