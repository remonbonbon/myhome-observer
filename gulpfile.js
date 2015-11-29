/*eslint strict: [2, "global"]*/
'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var gulpIf = require('gulp-if');
var minimist = require('minimist');

var eslint = require('gulp-eslint');
var jade = require('gulp-jade');
var webpack = require('gulp-webpack');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');

mainBowerFiles = mainBowerFiles({
	overrides: {
		bootstrap: {
			main: [
				'dist/css/bootstrap.css',
				'dist/js/bootstrap.js',
				'dist/fonts/*.*',
			]
		}
	}
});

// CLI options
var options = minimist(process.argv.slice(2), {
	boolean: 'debug',
	default: {
		debug: false
	}
});

// Build configurations
var BUILD = {
	jsServer: {
		watch: ['./server.js', './src/server/**/*.js'],
	},
	jsClient: {
		src: ['./src/client/app.js'],
		watch: ['./src/client/**/*.js'],
		dest: 'bundle.js',
	},
	html: {
		src: ['./src/jade/app.jade'],
		watch: ['./src/jade/**/*.jade'],
		dest: 'index.html',
	},
	dest: {
		public: './build/',
		temp: './temp/',
	}
};

// ESlint
gulp.task('eslint-gulp', function() {
	return gulp.src('gulpfile.js')
		.pipe(eslint())
		.pipe(eslint.format());
});
gulp.task('eslint-server', function() {
	return gulp.src(BUILD.jsServer.watch)
		.pipe(eslint())
		.pipe(eslint.format());
});
gulp.task('eslint-client', function() {
	return gulp.src(BUILD.jsClient.watch)
		.pipe(eslint())
		.pipe(eslint.format());
});

// Bower
gulp.task('bower-js', function() {
	return gulp.src(mainBowerFiles)
		.pipe(filter('*.js'))
		.pipe(concat('vendor.js'))
		.pipe(uglify({preserveComments: 'some'}))
		.pipe(gulp.dest(BUILD.dest.temp));
});
gulp.task('bower-css', function() {
	return gulp.src(mainBowerFiles)
		.pipe(filter('*.css'))
		.pipe(concat('vendor.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest(BUILD.dest.temp));
});
gulp.task('bower-fonts', function() {
	return gulp.src(mainBowerFiles)
		.pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
		.pipe(gulp.dest(BUILD.dest.public + 'fonts'));
});

// Build javascript
gulp.task('webpack', function() {
	return gulp.src(BUILD.jsClient.src)
		.pipe(webpack())
		.pipe(gulpIf(!options.debug, uglify()))
		.pipe(rename(BUILD.jsClient.dest))
		.pipe(gulp.dest(BUILD.dest.temp));
});

// Build html
gulp.task('jade', [
	'bower-js',
	'bower-css',
	'webpack',
], function() {
	return gulp.src(BUILD.html.src)
		.pipe(jade({
			locals: {
				path: {
					vendorCss: 'vendor.css',
					vendorJs: 'vendor.js',
					js: BUILD.jsClient.dest,
				}
			},
			pretty: options.debug
		}))
		.pipe(rename(BUILD.html.dest))
		.pipe(gulp.dest(BUILD.dest.public));
});

// Build all
gulp.task('build', [
	'bower-js',
	'bower-css',
	'bower-fonts',
	'webpack',
	'jade',
]);

// Watch all
gulp.task('watch', function() {
	gulp.watch('gulpfile.js', ['eslint-gulp']);
	gulp.watch(BUILD.jsServer.watch, ['eslint-server']);
	gulp.watch(BUILD.jsClient.watch, ['eslint-client', 'webpack', 'jade']);
	gulp.watch(BUILD.html.watch, ['jade']);
});

// Default task
gulp.task('default', [
	'eslint-gulp',
	'eslint-server',
	'eslint-client',
	'build',
	'watch',
]);
