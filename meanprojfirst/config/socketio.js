// config/socketio.js

// socket.io configuration middleware to retrieve the session user

var config 			= require('./config'),
	cookieParser 	= require('cookie-parser'),
	passport		= require('passport');



module.exports = function (server, io, mongoStore) {

	// to intercept the handshake process
	io.use(function (socket, next) {

		// using Express cookie-parser to parse the handshake request cookie and retrieve
		//	the Express sessionId
		cookieParser(config.sessionSecret)(socket.request, {} ,
			function (err) {
				var sessionId = socket.request.signedCookies['connect.sid'];

				// use connect-mongo instance to retreive the session info from the
				//	MongoDB storage
				mongoStore.get(sessionId, function (err, session) {
					socket.request.session = session;

					// to populate the session's user object according to the session info
					passport.initialize()(socket.request, {}, function () {
						passport.session()(socket.request, {}, function () {
							if (socket.request.user) {
								// only authenticated users can open a socket comm with server
								//	and prevent anauthorized connections
								next(null, true);
							} else {
								next(new Error('User is not authenticated'), false);
							}
						});
					});
				});
			}
		);
	});

	io.on('connection', function (socket) {
		
		// configure the socket server to include the chat controller
		require('../app/controllers/chat.server.controller')(io, socket);
	});
};