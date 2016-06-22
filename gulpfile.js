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

gulp.task('copy-to-dist', ['build'], function () {
  return gulp.src('app/www/**/*.*')
             .pipe(gulp.dest('./dist'));
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
