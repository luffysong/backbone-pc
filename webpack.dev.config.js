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
			{
				test: require.resolve('jquery'),
				loader: 'exports?window.$!jquery'
			},
			{
				test: require.resolve('backbone'),
				loader: 'exports?window.Backbone!backbone'
			},
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
			"jquery":path.resolve(__dirname,'./node_modules/jquery/dist/jquery.js'),
			"backbone":path.resolve(__dirname,'./node_modules/backbone/backbone.js')
		}
	}
}
module.exports = config;