// app/controllers/chat.server.controller.js

module.exports = function (io, socket) {


	// to inform all the connected socket clients about the newly
	//  connected user.
	// this was done by emitting the chatMessage event, and passing a 
	//	chat message object with the user information and the message text,
	//	time, and type.  
	// Since we took care of the user authentication in our socket server config,
	//	the user info is available from the socket.request.user object.	
	io.emit('chatMessage', {
		type: 'status',
		text: 'connected',
		created: Date.now(),
		username: socket.request.user.username
	});

	// take care of messages sent from the socket client.
	socket.on('chatMessage', function (message) {
		message.type = 'message',
		message.created = Date.now();
		message.username = socket.request.user.username;

		// will send the modified message object to all connected socket clients
		io.emit('chatMessage', message);
	});

	// handle disconnect
	// will notify all the connected scoket clients about this event
	socket.on('disconnect', function () {
		io.emit('chatMessage', {
			type: 'status',
			text: 'disconnected',
			created: Date.now(),
			username: socket.request.user.username
		});
	});

};