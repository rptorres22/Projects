// public/chat/services/socket.client.service.js

// Invoke 'strict' JavaScript mode
//'use strict';

// Create the Socket.io wrapper service
angular.module('chat').service('Socket', ['Authentication', '$location', '$timeout', 

	function (Authentication, $location, $timeout) {

		// Connect to the Socket.io server only when authenticate
		// Check whether user is authenticated using the Authentication service
		// If user is not, user will be redirected to home page using $location service
		// Since AngularjS services are lazily loaded, the Socket service
		//	will only load when requested.  This will prevent unauthorized users from
		//	using the Socket service
		if (Authentication.user) {
		
			// when authenticated, the service socket property is set by calling
			//	the io() method of Socket.io
			this.socket = io();
		} else {
			$location.path('/');
		}


		// Wrap the Socket.io 'on' method
		/*
		In this method, you used a common AngularJS trick that involves the $timeout service.
		The problem we need to solve here is that AngularJS data binding only works for
		methods that are executed inside the framework. This means that unless you notify
		the AngularJS compiler about third-party events, it will not know about changes
		they cause in the data model. In our case, the socket client is a third-party library
		that we integrate in a service, so any events coming from the socket client might
		not initiate a binding process. To solve this problem, you can use the $apply and
		$digest methods; however, this often causes an error, since a digest cycle might
		already be in progress. A cleaner solution is to use $timeout trick. The $timeout
		service is a wrapper around the window.setTimeout() method, so calling it without
		the timeout argument will basically take care of the binding issue without any
		impact on user experience
		*/
		this.on = function (eventName, callback) {
			if (this.socket) {
				this.socket.on(eventName, function (data) {
					$timeout(function () {
						callback(data);
					});
				});
			}
		};

		// Wrap the Socket.io 'emit' method
		this.emit = function (eventName, data) {
			if (this.socket) {
				this.socket.emit(eventName, data);
			}
		};

		// Wrap the Socket.io 'removeListener' method
		this.removeListener = function(eventName) {
			if (this.socket) {
				this.socket.removeListener(eventName);
			}
		};

	}

]);