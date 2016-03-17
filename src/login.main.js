$(function(){

    var url = require('url');
    var store = require('store');
    var location = window.location;
    var urlObj = url.parse(location.href);
    var signout = store.get('signout');
    if (signout) {
        store.remove('signout');
        location.href = 'http://login.yinyuetai.com/logout';
        return;
    };
    var UserModel = require('UserModel');
    var TopBarView = require('./view/topbar/topbar.view');
    var IMModel = require('./lib/IMModel');
    var store = require('store');
    var topbarView = new TopBarView();
    var imModel = IMModel.sharedInstanceIMModel();
    var user = UserModel.sharedInstanceUserModel();
    var MsgBox = require('ui.MsgBox');
    var isLogined = false;
    var fetchIMUserSig = function(){
		imModel.fetchIMUserSig(function(sig){
			if (!sig.anchor) {
				store.remove('imSig');
                MsgBox.showError('获取签名错误，原因：你可能不是主播；');
			}else{
                //处理登录成功跳转到设置页面
                var origin = location.origin;
                window.location.href = origin + '/web/anchorsetting.html';
            };
		},function(e){
			//处理请求错误
			MsgBox.showError('获取签名错误，原因：网络或服务器错误');
		});
	}
    if (!user.isLogined()) {
        //如果未登录状态，清除签名
        store.remove('imSig');
        topbarView.on('logined',function(){
            fetchIMUserSig();
        });
        topbarView.showLoginDialog();
    }else{
        fetchIMUserSig();
    }
});
