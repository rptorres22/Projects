var config			= require('./config'),

	http 			= require('http'), // needed for socketio
	socketio		= require('socket.io'), 

	express 		= require('express'),
	morgan 			= require('morgan'),
	compress 		= require('compression'),
	bodyParser 		= require('body-parser'),
	methodOverride 	= require('method-override'),
	session			= require('express-session'),
	flash			= require('connect-flash'),
	passport		= require('passport');

module.exports = function () {

	var app = express();

	// configuring socketio
	// ----
	// create server object using http core module and wrap the express app object
	var server = http.createServer(app);
	// attach socket.io to server object
	var io = socketio.listen(server);


	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}


	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(bodyParser.json());
	app.use(methodOverride());


	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret
	}));


	app.set('views', './app/views');
	app.set('view engine', 'ejs');


	app.use(flash());


	app.use(passport.initialize());
	app.use(passport.session());


	require('../app/routes/index.server.routes.js')(app);
	require('../app/routes/users.server.routes.js')(app);
	require('../app/routes/articles.server.routes.js')(app);


	app.use(express.static('./public'));

	//return app;

	// for socket.io, return the server object instead of the app object
	// when this starts, it will run socket.io server along with the express application
	return server;

	/*
		While you can already start using Socket.io, there is still one major problem with
		this implementation. Since Socket.io is a standalone module, requests that are
		sent to it are detached from the Express application. This means that the Express
		session information is not available in a socket connection. This raises a serious
		obstacle when dealing with your Passport authentication in the socket layer of
		your application. To solve this issue, you will need to configure a persistent session
		storage, which will allow you to share your session information between the Express
		application and Socket.io handshake requests.
	*/
};