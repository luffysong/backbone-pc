var webpack = require('webpack');
var path = require('path');
var plugins = [];
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var optimize = webpack.optimize
var extractLESS = new ExtractTextPlugin('../style/[name].css');
plugins.push(new optimize.CommonsChunkPlugin('common.js'));
plugins.push(extractLESS);
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
			}
		]
	},
	plugins:plugins,
	resolve:{
		alias:{
			"BaseModel":path.resolve(__dirname,'YYT_PC_Modules/baseModel'),
			"BaseView":path.resolve(__dirname,'YYT_PC_Modules/baseView'),
			"cookie":path.resolve(__dirname,'YYT_PC_Modules/cookie'),
			"store":path.resolve(__dirname,'YYT_PC_Modules/locationStore'),
			"url":path.resolve(__dirname,'YYT_PC_Modules/url'),
			"tools":path.resolve(__dirname,'YYT_PC_Modules/tools'),
			"RequestModel":path.resolve(__dirname,'src/lib/request.model')
		}
	}
}
// console.log(path.resolve(__dirname,'node_modules/jquery/dist/jquery.js'))
module.exports = config;