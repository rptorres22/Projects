// server.js

/*
	this is the main file that you will run 
*/

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose 	= require('./config/mongoose'),
	express 	= require('./config/express'),
	passport 	= require('./config/passport');

var db 	= mongoose();
var app = express(db);		// now passing the db for mongoStore
var passport = passport();

app.listen(3000);

module.exports = app;

console.log('Server running at http://localhost:3000');