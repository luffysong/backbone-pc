var config = {
	scheme: 'alpha',
	env:{
		alpha:{
			'url_prefix':'http://localhost:4000'
		},
		release:{
			'url_prefix':''
		}
	},
	debug:true
};

module.exports = config;