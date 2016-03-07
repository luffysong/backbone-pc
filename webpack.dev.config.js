var webpack = require('webpack');
var path = require('path');
var plugins = [];
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var optimize = webpack.optimize
var extractLESS = new ExtractTextPlugin('../style/[name].css');
plugins.push(extractLESS);
plugins.push(new optimize.CommonsChunkPlugin('common.js'));
var sourceMap = require('./map.json').source;
var config = {
	entry:sourceMap,
	output:{
		path:path.resolve(__dirname + '/js'),
		filename:'[name].js'
	},
	devtool:'source-map',
	module:{
		loaders:[
			// {
			// 	test: require.resolve('jquery'),
			// 	loader: 'module.exports?window.jQuery'
			// },
			// {
			// 	test: require.resolve('backbone'),
			// 	loader: 'exports?window.Backbone'
			// },
			{
				test:/\.html$/,
				loader:'raw',
				exclude:/(node_modules)/
			},
			{
				test:/\.js$/,
				loader:'eslint-loader',
				exclude:/(node_modules)/
			},
			{
				test: /\.less$/i,
				loader: extractLESS.extract(['css','less'])
			},
			{ 
				test: /\.(png|jpg)$/, 
				loader: 'url-loader?limit=8192' 
			} 
		]
	},
	plugins:plugins,
	resolve:{
		alias:{
			"tplEng":path.resolve(__dirname,'link/template'),  //模板引擎
			"BaseModel":path.resolve(__dirname,'YYT_PC_Modules/baseModel'),
			"BaseView":path.resolve(__dirname,'YYT_PC_Modules/baseView'),
			"store":path.resolve(__dirname,'YYT_PC_Modules/store/locationStore'),
			"cookie":path.resolve(__dirname,'YYT_PC_Modules/store/cookie'),
			"url":path.resolve(__dirname,'YYT_PC_Modules/util/url'),
			"tools":path.resolve(__dirname,'YYT_PC_Modules/util/tools'),
			"pwdencrypt":path.resolve(__dirname,'YYT_PC_Modules/crypto/pwdencrypt'),
			"secret":path.resolve(__dirname,'YYT_PC_Modules/crypto/secret'),
			"UploadFile":path.resolve(__dirname,'YYT_PC_Component/feature/UploadFile'),
			"AjaxForm":path.resolve(__dirname,'YYT_PC_Component/feature/AjaxForm'),
			"Scrollbar":path.resolve(__dirname,'YYT_PC_Component/feature/Scrollbar'),
			"UserModel":path.resolve(__dirname,'YYT_PC_Component/business/UserModel/'),
			"ui.Dialog":path.resolve(__dirname,'YYT_PC_Component/ui/dialog/'),
			"config":path.resolve(__dirname,'src/config')
		}
	},
	externals:{
		jquery:'window.jQuery',
		backbone:'window.Backbone',
		underscore:'window._'
	}
}
// console.log(path.resolve(__dirname,'node_modules/jquery/dist/jquery.js'))
module.exports = config;