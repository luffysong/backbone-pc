$(function(){

	var MainView = require('./view/anchor/main.view');
	new MainView();

	var TopbarView = require('./view/topbar/topbar.view');
	new TopbarView();

	//载入CSS
	require('../style/less/anchor.less');  
});