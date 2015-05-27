// public/chat/controllers/chat.server.controller.js

angular.module('chat').controller('ChatController', ['$scope', 'Socket', 

	function ($scope, Socket) {

		// create messages array
		$scope.messages = [];


		// implementing chatMessage event listener that will
		// 	add retrieved messages to the array above
		Socket.on('chatMessage', function (message) {
			$scope.messages.push(message);
		});

		// to send new messages by emitting the chatMessage event
		//	to the socket server.
		$scope.sendMessage = function () {
			var message = {
				text: this.messageText
			};

			Socket.emit('chatMessage', message);

			this.messageText = '';
		}

		// using in-built $destroy event to remove the chatMessage 
		//  event listener from the socket client.
		// the $destroy event will be emitted when the controller instance 
		//	is deconstructed.  This is important because the event handler will
		//	still get executed unless you remove it.
		$scope.$on('$destroy', function () {
			Socket.removeListener('chatMessage');
		})
	}

]);