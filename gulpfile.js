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
var autoprefixer = require('gulp-autoprefixer');

sass.compiler = require('node-sass');

// path 
var PATH = {
  HTML: './src',
  ASSETS: {
    FONTS: './src/assets/fonts',
    IMAGES: './src/assets/images',
    CSS: './src/assets/css',
    JS: './src/assets/js'
  }
}
var DEST_PATH = {
  HTML: './dist',
  ASSETS: {
    FONTS: './dist/assets/fonts',
    IMAGES: './dist/assets/images',
    CSS: './dist/assets/css',
    JS: './dist/assets/js',
  }
}


// file include
gulp.task('fileinclude', () => {
  return new Promise(resolve => {
    gulp.src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./src'));
    resolve();
  });
});


// image sprite
gulp.task('sprite', function(){
  return new Promise(resolve => {
    var spriteData = gulp.src(PATH.ASSETS.IMAGES+'/sprite/*.png')
    .pipe(spritesmith({
        imgPath: '../images/icon_brillion.png',
        imgName: 'icon_brillion.png',
        padding: 4,
        cssName: '_sprite.css'
    }));
    spriteData.img.pipe(gulp.dest(PATH.ASSETS.IMAGES));
    spriteData.css.pipe(gulp.dest(PATH.ASSETS.CSS));
    resolve();
  })
  
});

// html 
gulp.task('html', () => {
  return new Promise(resolve => {
    gulp.src(PATH.HTML + '/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(DEST_PATH.HTML));
    resolve();
  });
});

// images 
gulp.task('images', () => {
  return new Promise(resolve => {
    gulp.src(PATH.ASSETS.IMAGES  + '/**/*.{png,jpg,jpeg,gif,svg}')
    .pipe(gulp.dest(DEST_PATH.ASSETS.IMAGES));
    resolve();
  });
});

// js 
gulp.task('js', () => {
  return new Promise(resolve => {
    gulp.src(PATH.ASSETS.JS  + '/*.js')
    .pipe(gulp.dest(DEST_PATH.ASSETS.JS));
    resolve();
  });
});

// sass 
gulp.task('sass', function () {
  return gulp.src('./src/assets/css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/assets/css'))
});

// css
gulp.task('css', () => {
  return new Promise(resolve => {
    gulp.src(PATH.ASSETS.CSS  + '/*.css')
    .pipe(gulp.dest(DEST_PATH.ASSETS.CSS))
    resolve();
  });
});

gulp.task('autoprefixer', () => {
  return new Promise(resolve => {
    gulp.src(DEST_PATH.ASSETS.CSS  + '/style.css')
    .pipe(autoprefixer({
      cascade: false
  }))
  .pipe(gulp.dest(DEST_PATH.ASSETS.CSS))
    resolve();
  });
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
    del.sync(DEST_PATH.ASSETS.IMAGES);
    resolve();
  });
});


// watch 
gulp.task('watch', () => {
  return new Promise(resolve => {
    gulp.watch(PATH.HTML + "/*.html", gulp.series(['html']));
    gulp.watch(PATH.ASSETS.IMAGES, gulp.series(['images']));
    gulp.watch(PATH.ASSETS.CSS + "/*.scss", gulp.series(['sass']));
    gulp.watch(PATH.ASSETS.JS + "/*.js", gulp.series(['js']));
    gulp.watch(PATH.ASSETS.CSS + "/style.css", gulp.series(['css']));
    resolve();
  });
});


var allSeries = gulp.series(['fileinclude', 'sass', 'html', 'images', 'autoprefixer', 'js', 'sprite', 'nodemon:start', 'browserSync', 'watch']);

gulp.task( 'default', allSeries);
