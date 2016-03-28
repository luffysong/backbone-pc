var config = {
	scheme: 'alpha',
	 //scheme: 'release',
	env:{
		alpha:{
			'url_prefix':'http://beta.yinyuetai.com:9019'
		},
		release:{
			'url_prefix':'http://lapi.yinyuetai.com'
		}
	},
	debug:true,
	domains:{
		'urlStatic':'http://s.yytcdn.com',
		'loginSite':'http://login.yinyuetai.com',
		'mainSite':'http://www.yinyuetai.com',
		'mvSite':'http://mv.yinyuetai.com',
		'homeSite':'http://i.yinyuetai.com',
		'vchartSite':'http://vchart.yinyuetai.com',
		'commentSite':'http://comment.yinyuetai.com',
		'playlistSite':'http://pl.yinyuetai.com',
		'searcresiehSite':'http://so.yinyuetai.com',
		'vSite':'http://v.yinyuetai.com',
		'fanSite':'',
		'paySite':'',
		'tradeSite':'',
		'shopSite':'',
		'vipSite':''
	}
};
module.exports = config;
