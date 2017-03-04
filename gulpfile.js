var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
	stylus = require('gulp-stylus');

	
gulp.task('join', function(){
    return gulp.src(['static/js/jquery.js','static/js/jquery-ui.js','static/js/jquery.jplayer.min.js','static/js/jplayer.playlist.min.js','static/js/iscroll.min.js','static/js/musicPlayer.js','static/js/.js','static/js/.js'])
        .pipe(concat('concat.js'))
        .pipe(gulp.dest('static/js/'))
        .pipe(uglify())
        .pipe(gulp.dest('static/js/'));
});

gulp.task('stylus', function () {
  return gulp.src('static/css/styles.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(gulp.dest('static/css/'));
});

gulp.task('default', ['join', 'stylus'], function(){
	
});