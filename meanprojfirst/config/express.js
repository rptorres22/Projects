var config			= require('./config'),

	http 			= require('http'), // needed for socketio
	socketio		= require('socket.io'), 

	express 		= require('express'),
	morgan 			= require('morgan'),
	compress 		= require('compression'),
	bodyParser 		= require('body-parser'),
	methodOverride 	= require('method-override'),
	session			= require('express-session'),

	MongoStore		= require('connect-mongo')(session), // to store session in the DB

	flash			= require('connect-flash'),
	passport		= require('passport');

module.exports = function (db) {

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

	

	// configuring mongoStore
	var mongoStore = new MongoStore({
		//db: db.connection.db //the book had this old way of doing it

		// the db argument is passed from server.js
		mongooseConnection: db.connection //new way of connecting 0.8.1
	});


	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: mongoStore // configuring for mongostore
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

	//return app;  //this was before we used socket.io

	// configuring socketio
	require('./socketio')(server, io, mongoStore);

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

		To configure your Socket.io session to work in conjunction with your Express
		sessions, you have to find a way to share session information between Socket.io and
		Express. Since the Express session information is currently being stored in memory,
		Socket.io will not be able to access it properly. So, a better solution would be to store
		the session information in your MongoDB. Fortunately, there is node module named
		connect-mongo that allows you to store session information in a MongoDB instance
		almost seamlessly. To retrieve the Express session information, you will need some
		way to parse the signed session cookie information. For this purpose, you'll also
		install the cookie-parser module, which is used to parse the cookie header and
		populate the HTTP request object with cookies-related properties.
	*/
};