var gulp = require('gulp'),
	nodemon = require('gulp-nodemon');

gulp.task('default', function () {
	nodemon({
		script: 'app.js', 	// what to run
		ext: 'js',			// what to watch for (.js files)
		env: {
			PORT: 8000 		// can set the port number
		},
		ignore: ['./node_modules/**']
	})
	.on('restart', function () {
		console.log('Restarting');
	});
});