$(function(){

	//组件一，编辑背景图片
	var EditBgView = require('./view/anchorEditBg.view');
	var editBgView = new EditBgView();

	//组件二，主播信息
	var InfoView = require('./view/anchorInfo.view');
	var infoView = new InfoView();


	//组件三，主播控制消息
	var ChatView = require('./view/anchorChat.view');
	var chatView = new ChatView();



	//载入CSS
	
	require('../style/less/index.less');   
});