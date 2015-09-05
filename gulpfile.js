'use strict';

var gulp = require('gulp');
var rename = require("gulp-rename");
var gulpIf = require("gulp-if");
var minimist = require('minimist');

var eslint = require('gulp-eslint');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var webpack = require('gulp-webpack');
var uglify = require('gulp-uglify');

// CLI options
var options = minimist(process.argv.slice(2), {
  boolean: 'debug',
  default: {
    debug: false
  }
});

// Build configurations
var BUILD = {
  js: {
    src: ['./src/app.js'],
    watch: ['./src/*.js'],
    dest: 'bundle.js',
  },
  html: {
    src: ['./src/app.jade'],
    watch: ['./src/*.jade'],
    dest: 'index.html',
  },
  dest: './build/'
};

// ESlint
gulp.task('eslint', function () {
  gulp.src(BUILD.js.watch)
    .pipe(eslint())
    .pipe(eslint.format());
});

// Build javascript
gulp.task('js', function() {
  gulp.src(BUILD.js.src)
    .pipe(webpack())
    .pipe(gulpIf(!options.debug, uglify()))
    .pipe(rename(BUILD.js.dest))
    .pipe(gulp.dest(BUILD.dest))
});

// Build html
gulp.task('html', function() {
  gulp.src(BUILD.html.src)
    .pipe(jade({
      locals: {
        path: {
          js: BUILD.js.dest,
        }
      },
      pretty: options.debug
    }))
    .pipe(rename(BUILD.html.dest))
    .pipe(gulp.dest(BUILD.dest))
});

// Build all
gulp.task('build', [
  'js',
  'html',
]);

// Watch all
gulp.task('watch', function() {
  gulp.watch(BUILD.js.watch, ['eslint', 'js']);
  gulp.watch(BUILD.html.watch, ['html']);
});

// Default task
gulp.task('default', [
  'eslint',
  'build',
  'watch',
]);
