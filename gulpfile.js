var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('del');
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
	return gulp.src(['src/vendor/*.js','src/bcpieSDK.js','src/tricks/*.js'])
		.pipe(concat('bcpie.js'))
		.pipe(gulp.dest('build'))
		.pipe(uglify())
		.pipe(rename('bcpie.min.js'))
		.pipe(gulp.dest('build'))
		.on('error', gutil.log)
});

gulp.task('watch', function () {
    watch(['src/vendor/*.js','src/bcpieSDK.js','src/tricks/*.js'], function () {
        gulp.start('bcpie');
    });
});