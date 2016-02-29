var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var buffer = require('buffer');
var gulp = require('gulp');
var clean = require('gulp-clean');
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
//var rename = require('gulp-rename');
//var concat = require('gulp-concat');
//var size = require('gulp-size');
var minifycss = require('gulp-minify-css');

// 配置本地服务器
var browser = require('browser-sync');
var browserSync = browser.create();


var PORT = 4000
var loadMap = [
	'modules/*.*',
	'src/**/*.*',
	'./*.html',
       './web/*.html'
];
gulp.task('server',[], function() {
    // content
    	browserSync.init({
    		server:'./',
    		port:PORT
    	});
    	gulp.watch(loadMap, function(file){
    		console.log(file.path)
    		browserSync.reload()
    	});
});

// 清理dist目录
gulp.task('clean', function() {
    // content
      return gulp.src(['./dist/'],{read:false}).pipe(clean());
});



//进入build
gulp.task('build',['build:move'],function(){
  // content
      
});

gulp.task('build:move',['clean'], function() {
    // content
    var dontMovePath = '!./';
    var movePath = './';
    return gulp.src([
      movePath+'link/base.library.js',
      movePath+'img/*.*',
      movePath+'web/*.*',
      movePath+'style/*.css',
      movePath+'js/*.js'
    ],{base:'.'})
    .pipe(gulpif('*.js',uglify({
        warnings: true,
        compress:{
               pure_funcs: [ 'console.log','warn' ]
        }
    })))
    .pipe(gulpif('*.css',autoprefixer({
        browsers: ['last 2 versions', 'Android >= 4.0'],
        cascade: true, //是否美化属性值 默认：true 像这样：
        //-webkit-transform: rotate(45deg);
        //        transform: rotate(45deg);
        remove:true //是否去掉不必要的前缀 默认：true 
    })))
    .pipe(gulpif('*.css',minifycss()))
    .pipe(gulp.dest('./dist/'));
});