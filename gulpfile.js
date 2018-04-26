var gulp        = require('gulp');
var concat      = require('gulp-concat');
var minify      = require('gulp-minify');
var cleanCss    = require('gulp-clean-css');
 
gulp.task('pack-js', function () {	
	return gulp.src([
            './assets/vendor/jquery/jquery.min.js', 
            './assets/vendor/bootstrap/js/bootstrap.bundle.min.js', 
            './assets/vendor/jquery-easing/jquery.easing.min.js', 
            './assets/vendor/vue.min.js', 
            './assets/vendor/showdown.min.js', 
            './assets/vendor/moment.min.js', 
            './assets/data/about.js', 
            './assets/data/experience.js',
            './assets/data/education.js', 
            './assets/data/skills.js', 
            './assets/resume.js'
        ])
		.pipe(concat('bundle.js'))
		.pipe(minify())
		.pipe(gulp.dest('./build'));
});
 
gulp.task('pack-css', function () {	
	return gulp.src([
            './assets/vendor/bootstrap/css/bootstrap.min.css', 
            './assets/vendor/font-awesome/css/font-awesome.css', 
            './assets/vendor/devicons/css/devicons.css', 
            './assets/vendor/simple-line-icons/css/simple-line-icons.css', 
            './assets/resume.css'
        ])
		.pipe(concat('stylesheet.min.css'))
		.pipe(cleanCss())
		.pipe(gulp.dest('./build'));
});
 
gulp.task('default', ['pack-js', 'pack-css']);