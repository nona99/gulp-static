'use strict';

var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps')
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var del = require('del');
var spritesmith = require('gulp.spritesmith');
var buffer = require('vinyl-buffer');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var merge = require('merge-stream');

sass.compiler = require('node-sass');

// path 
var PATH = {
  HTML: './src',
  ASSETS: {
    FONTS: './src/assets/fonts',
    IMAGES: './src/assets/images',
    CSS: './src/assets/scss'
  }
}
var DEST_PATH = {
  HTML: './dist',
  ASSETS: {
    FONTS: './dist/assets/fonts',
    IMAGES: './dist/assets/images',
    CSS: './dist/assets/css'
  }
}



// file include
gulp.task('fileinclude', () => {
  return new Promise(resolve => {
    gulp.src(['./src/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./src'));
    resolve();
  });
});


// sass 
gulp.task('sass', function () {
  return gulp.src('./src/assets/scss/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./dist/assets/css'));
});


// html 
gulp.task('html', () => {
  return new Promise(resolve => {
    gulp.src(PATH.HTML + '/*.html')
    .pipe(gulp.dest(DEST_PATH.HTML));
    resolve();
  });
});


//image sprite
gulp.task('sprite', function () {
  var spriteData = gulp.src(PATH.ASSETS.IMAGES +'/sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
 var imgStream = spriteData.img

 .pipe(buffer())
 .pipe(imagemin())
 .pipe(gulp.dest(DEST_PATH.ASSETS.IMAGES));

var cssStream = spriteData.css
 .pipe(csso())
 .pipe(gulp.dest(DEST_PATH.ASSETS.CSS));

return merge(imgStream, cssStream);
});


// web server
gulp.task('nodemon:start', () => {
  return new Promise(resolve => {
    nodemon({
      script: 'app.js',
      watch: 'app'
    });
    resolve();
  });
});

gulp.task('browserSync', () => {
  return new Promise(resolve => {
    browserSync.init(null, {
      proxy: 'http://localhost:8005',
      port: 8006
    });
    resolve();
  });
});


// clean
gulp.task('clean', () => {
  return new Promise(resolve => {
    del.sync(DEST_PATH.HTML);
    resolve();
  });
});


// watch 
gulp.task('watch', () => {
  return new Promise(resolve => {
    gulp.watch(PATH.HTML + "*.html", gulp.series(['html']));
    gulp.watch(PATH.ASSETS.CSS + "*.scss", gulp.series(['sass']));
    resolve();
  });
});


var allSeries = gulp.series(['fileinclude', 'sass', 'html', 'sprite', 'nodemon:start', 'browserSync', 'watch']);

gulp.task( 'default', allSeries);

