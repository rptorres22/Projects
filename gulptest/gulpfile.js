// include gulp
var gulp = require('gulp');

// include plug-ins

//npm install gulp-jshint --save-dev
var jshint = require('gulp-jshint');

//npm install gulp-changed --save-dev
var changed = require('gulp-changed');			// to look for new or changed files
//npm install gulp-imagemin --save-dev
var imagemin = require('gulp-imagemin');		// to compress image files

//npm install gulp-minify-html
var minifyHTML = require('gulp-minify-html');	// tom minify all HTML files 

//npm install gulp-concat --save-dev
var concat = require('gulp-concat');			// to concat all files
//npm install gulp-strip-debug --save-dev
var stripDebug = require('gulp-strip-debug');	// strip console and debugger statements
//npm install gulp-uglify --save-dev
var uglify = require('gulp-uglify');			// take out whitespace

//npm install gulp-autoprefixer --save-dev
var autoprefix = require('gulp-autoprefixer'); // adds any required vendor prefixes to css
//npm install gulp-minify-css --save-dev
var minifyCSS = require('gulp-minify-css');		//minify css












// JS hint task
/* 
	This performs the following operations
	1. Includes Gulp.
	2. The gulp-jshint plug-in is included as an object named jshint.
	3. A new Gulp task named jshint is defined.  This pipes all scripts in the 
		"src/scripts" folder to the "jshint" object and outputs errors
		to the console.
*/

gulp.task('jshint', function() {					
	gulp.src('./src/scripts/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});


// minify new images
gulp.task('imagemin', function() {
	var imgSrc = './src/images/**/*',
		imgDst = './build/images';

	gulp.src(imgSrc)
		.pipe(changed(imgDst))
		.pipe(imagemin())
		.pipe(gulp.dest(imgDst));
});


// minify new or changed HTML pages
gulp.task('htmlpage', function() {
	var htmlSrc = './src/*.html',
		htmlDst = './build';

	gulp.src(htmlSrc)
		.pipe(changed(htmlDst))
		.pipe(minifyHTML())
		.pipe(gulp.dest(htmlDst));
});


// JS concat, strip debugging and minify
/*
	This example passes an array of filenames to "gulp.src()"; 
	I want "lib.js" to appear at the top of the production
	file followed by all other JavaScript files in any order. 
*/
gulp.task('scripts', function() {
	gulp.src(['./src/scripts/lib.js', './src/scripts/*.js'])
		.pipe(concat('scripts.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('./build/scripts'));
});


// CSS concat, auto-prefix and minify
/*
	The "autoprefixer plug-in" is passed a string or array 
	indicating the level of browser support - in this case,
	we want the current and previous versions of all 
	mainstream browsers.  It looks up each property at
	"caniuse.com" and adds additional vendor-prefixed 
	properties when necessary.

	Some other useful plugins: (find many more at npmjs.org)
	- gulp-sass - a Node.js version of the CSS pre-processor
	- gulp-clean - remove unncessary files and folders
	- gulp-file-include - use @@include('filename') in any file
	- gulp-size - log file and project file savings
*/
gulp.task('styles', function() {
	gulp.src(['./src/styles/*.css'])
		.pipe(concat('styles.css'))
		.pipe(autoprefix('last 2 versions'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('./build/styles/'));
});




// Automate Tasks
/*
	We can run one task at a time from the command line 
	ex. "gulp styles"
	Fortunately Gulp allows us to create a "default" task
	and run any number of dependent sub-tasks.  

	just type "gulp" in the command line
*/
// default gulp task
gulp.task('default', ['imagemin', 'htmlpage', 'scripts', 'styles'], function() {
	// all four tasks will run in squence

	/*
		Gulp can monitor yoru source files using the "watch" method, then
		run an appropriate task when a fiel change is made.  We can
		update the default task to check our HTML, CSS and JavaScript files

		the process will remain active and react to file changes.  You won't
		need to type it in again - Press Ctrl+C to abort monitoring and 
		return to the command line.
	*/
	// watch for HTML changes
	gulp.watch('./src/*.html', function() {
		gulp.run('htmlpage');
	});
	// watch for JS changes
	gulp.watch('./src/scripts/*.js', function() {
		gulp.run('jshint', 'scripts');
	});
	// watch for CSS changes
	gulp.watch('./src/styles/*.css', function() {
		gulp.run('styles');
	});

});