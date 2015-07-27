// public/chat/controllers/chat.server.controller.js

// Invoke 'strict' JavaScript mode
//'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', 'Socket', 

	function ($scope, Socket) {

		// Create a messages array
		$scope.messages = [];

		// Add an event listener to the 'chatMessage' event
		// Implementing chatMessage event listener that will
		// 	add retrieved messages to the array above
		Socket.on('chatMessage', function (message) {
			$scope.messages.push(message);
		});

		// Create a controller method for sending new messages
		// 	by emitting the chatMessage event
		//	to the socket server.
		$scope.sendMessage = function () {
			// Create a new message object
			var message = {
				text: this.messageText
			};

			// Emit a 'chatMessage' message event
			Socket.emit('chatMessage', message);

			// Clear the message text
			this.messageText = '';
		};

		// Remove the event listener when the controller instance is destroyed
		// using in-built $destroy event to remove the chatMessage 
		//  event listener from the socket client.
		// the $destroy event will be emitted when the controller instance 
		//	is deconstructed.  This is important because the event handler will
		//	still get executed unless you remove it.
		$scope.$on('$destroy', function () {
			Socket.removeListener('chatMessage');
		});
	}

]);