$(function(){

	var TopbarView = require('./view/topBar.view');
	new TopbarView();

	//组件一，编辑背景图片
	var EditBgView = require('./view/anchor/anchorEditBg.view');
	var editBgView = new EditBgView();

	//组件二，主播信息
	var InfoView = require('./view/anchor/anchorInfo.view');
	var infoView = new InfoView();


	//组件三，主播控制消息
	var ChatView = require('./view/anchor/anchorChat.view');
	var chatView = new ChatView();

	//公告组件
	var NoticeView = require('./view/anchor/notice.view');
	new NoticeView();

	//直播开始,结束控制
	var LiveShowBtnView = require('./view/anchor/liveShowBtn.view');
	new LiveShowBtnView();

	//载入CSS
	require('../style/less/anchor.less');  
});