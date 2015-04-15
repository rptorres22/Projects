var express = require('express');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();


//deprecated in express 4
//app.configure(function(){
//	app.set('views', __dirname + '/server/views');
//	app.set('view_engine', 'jade');
//});

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

//asterisk will match all routes
//client side routing will take over in the index page
app.get('*', function(req, res){
	res.render('index');
});




var port = 3030;
app.listen(port);
console.log('Listening on port ' + port + '...');