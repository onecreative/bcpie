var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('del');
var streamqueue  = require('streamqueue');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var changed = require('gulp-changed');
var watch = require('gulp-watch');

gulp.task('clean', function () {
	return gulp.src('build', {read: false})
		.pipe(clean());
});

gulp.task('bcpie', function() {
	return streamqueue({ objectMode: true },
			gulp.src('src/vendor/moment/moment.js'),
			gulp.src('src/vendor/moment-timezone/moment-timezone-with-data-2010-2020.js'),
			gulp.src('src/vendor/moment-timezone/moment-timezone-utils.js'),
			gulp.src('src/vendor/moment-parseformat/moment.parseFormat.js'),
			gulp.src('src/vendor/jquery.mobilephonenumber/*.js'),
			gulp.src('src/vendor/js-expression-eval/parser.js'),
			gulp.src('src/bcpieSDK.js'),
			gulp.src('src/tricks/*.js')
		)
		.pipe(concat('bcpie.js'))
		.pipe(gulp.dest('build'))
		.pipe(uglify())
		.pipe(rename('bcpie.min.js'))
		.pipe(gulp.dest('build'))
		.on('error', gutil.log);
});

gulp.task('watch', function () {
	watch(['src/vendor/**/*.js','src/bcpieSDK.js','src/tricks/*.js'], function () {
		gulp.start('bcpie');
	});
});