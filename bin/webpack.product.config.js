/**
 * Created by xiangwenwen on 16/4/12.
 */

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var containerPath = path.resolve('./');
var compileConfig = require('../app/compile.config.json');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractSASS = new ExtractTextPlugin('[name]-[hash].css');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var getEntry = require('./getEntry');
var rmdir = require('./rmdir');
var alias = require('./alias');
var compile = require('./compile');

//  清除www目录
rmdir('./dist');

//  对complie配置文件进行处理
//CDN配置
//compileConfig.cdn = compileConfig.cdn || '';
compileConfig = compile(compileConfig);

//  配置入口文件
var entrys = getEntry('./app/src/*.js');

//  添加插件
var plugins = [];

//  切割css文件
plugins.push(extractSASS);

//  提取公共文件
plugins.push(new webpack.optimize.CommonsChunkPlugin('common', 'common-[hash].js'));

//处理html
var pages = getEntry('./app/web/*.jade');
for (var chunkname in pages) {
  var conf = {
    filename: chunkname + '.html',
    template: pages[chunkname],
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: false
    },
    chunks: ['common', chunkname],
    hash: false,
    complieConfig: compileConfig
  }
  var titleC = compileConfig.title || {};
  var title = titleC[chunkname];
  if (title) {
    conf.title = title;
  }
  plugins.push(new HtmlWebpackPlugin(conf));
}

//生产环境优化

//plugins.push(new webpack.optimize.UglifyJsPlugin({
//    compress:{
//        warnings: false
//    }
//}));
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'product';
}
console.log('////////////////////////////////', process.env.NODE_ENV);
//  注入环境变量
plugins.push(new webpack.DefinePlugin({
  process: {
    env: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }
}));

//  配置webpack
var config = {
  entry: entrys,
  output: {
    path: path.resolve(containerPath, 'dist'),
    publicPath: './',
    filename: '[name]-[hash].js'
  },
  devtool: 'eval-source-map',
  module: {
    loaders: [{
      test: /\.html$/,
      loader: 'raw',
      exclude: /(node_modules)/
    }, {
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /(node_modules)/
    }, {
      test: /\.scss$/i,
      loader: extractSASS.extract(['css', 'sass'])
    }, {
      test: /.jade$/i,
      loader: 'jade-loader',
      exclude: /(node_modules)/
    }, {
      test: /\.(png|jpg|gif)$/,
      loader: 'url-loader?limit=8192&name=images/[name]-[hash].[ext]'
    }]
  },
  plugins: plugins,
  resolve: {
    alias: alias,
    extensions: ['', '.js', '.css', '.scss', '.jade', '.png', '.jpg']
  },
  externals: {
    jquery: 'window.jQuery',
    backbone: 'window.Backbone',
    underscore: 'window._',
    webim: 'webim'
  }
};
module.exports = config;
