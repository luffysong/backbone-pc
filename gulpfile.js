var gulp = require('gulp');
var browser = require('browser-sync');
var browserSync = browser.create();
var rimraf = require('rimraf');


gulp.task('server', ['build'], function () {
  browserSync.init({
    server: './app/www/',
    port: 4000
  });
  //gulp.watch('./app/**/*.*', function (file) {
  //  console.log(file.path);
  //  browserSync.reload();
  //});
  //gulp.watch('./app/link/**/*.*', function () {
    gulp.start('build', function () {
      browserSync.reload();
    });
  //});
});

gulp.task('clean', function () {
  rimraf.sync('./dist');
});

var gutil = require('gulp-util');
gulp.task('build', ['clean'], function () {
  return gulp.src([
               'app/flash/*.*',
               'app/link/*.*',
               'app/link/**/*.*',
               'app/extend/**/*.*'
             ], {base: 'app/'})
             .pipe(gulp.dest('app/www/'));
});

<<<<<<< HEAD
gulp.task('build:move', ['clean'], function () {
  // content
  var dontMovePath = '!./';
  var movePath = './';
  return gulp.src([
      movePath + 'link/*.js',
      //movePath + 'link/webim.js',
      //movePath + 'link/json2.js',
      //movePath + 'link/jQuery/jquery.jcarousel.min.js',
      //movePath + 'link/jQuery/jquery.jcarousel.min.js',
      movePath + 'img/**/*.*',
      movePath + 'web/*.*',
      movePath + '*.html',
      movePath + 'flash/*.*',
      movePath + 'style/**/*.css',
      movePath + 'cross-url/*.*',
      movePath + 'js/*.js'
    ], {base: '.'})
    .pipe(gulpif('*.js',uglify({
        compress:{
            pure_funcs:['console.log','warn']
        }
    })))
    // .pipe(gulpif('*.js', uglify({
    //   warnings: true,
    //   compress: {
    //     pure_funcs: ['console.log', 'warn']
    //   }
    // })))
    .pipe(gulpif('*.css', autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4.0'],
      cascade: true, //是否美化属性值 默认：true 像这样：
      //-webkit-transform: rotate(45deg);
      //        transform: rotate(45deg);
      remove: true //是否去掉不必要的前缀 默认：true
    })))
    .pipe(gulpif('*.css', minifycss()))
    .pipe(gulp.dest('./dist/'));
=======
gulp.task('copy-to-dist', ['build'], function () {
  return gulp.src('app/www/**/*.*')
             .pipe(gulp.dest('./dist'));
>>>>>>> be37aadcc36595a728669c4805f64583e20c1c3e
});

gulp.task('webpack', function (callback) {
  var webpack = require('webpack');
  var productConfig = require('./bin/webpack.product.config.js');
  webpack(productConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString());
    callback();
  });
});
