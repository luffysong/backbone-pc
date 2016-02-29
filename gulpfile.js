var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var buffer = require('buffer');
var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
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
  './demo/**/*.*'
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
gulp.task('build',['build:less'],function(){
  // content
      
});

gulp.task('build:move',['clean'], function() {
    // content
    var dontMovePath = '!./';
    var movePath = './';
    return gulp.src([
      movePath+'link/bundle.js',
      movePath+'link/require.js',
      movePath+'img/*.*',
      movePath+'web/*.*',
      movePath+'style/*.*',
      movePath+'js/*.js'
    ],{base:'.'})
    .pipe(gulpif('*.js',uglify({
        warnings: true,
        compress:{
               pure_funcs: [ 'console.log','warn' ]
        }
    })))
    .pipe(gulpif('*.css',minifycss()))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build:less',['build:move'],function () {

    return gulp.src('style/less/*.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(gulp.dest('style'));
});

gulp.task('watch',function () {
    gulp.watch('style/less/**/*.less', ['less']);
});

var LINK = './link/';
var linkMap = [
    LINK+'jquery-1.12.0.js',
    LINK+'underscore.js',
    LINK+'backbone.js'
];
gulp.task('link',function(){

      return gulp.src(linkMap)
      .pipe(concat('bundle.js'))
      .pipe(size({showFiles: true, title: 'source'}))
      .pipe(size({showFiles: true, title: 'minified'}))
      .pipe(size({showFiles: true, gzip: true, title: 'gzipped'}))
      .pipe(gulp.dest(LINK));
})