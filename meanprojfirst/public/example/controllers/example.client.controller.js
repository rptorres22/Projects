// public/controllers/example.client.controller.js

// Invoke 'strict' JavaScript mode
//'use strict';

/*
	Controllers are basic constructor functions which angular uses
	 to create new instance of a controller object.  The purpose is
	 to augment data model reference objects called scopes.
	
	Scope is the glue between the view and the controller.  Using
	the scope object, the controller can manipulate the model, which
	automatically propagates these changes to the view.

	You also need to include this file via script tags in the view
	as well as place the ng-controller directive in the html element

*/

// Create the 'example' controller
angular.module('example').controller('ExampleController', ['$scope', 'Authentication',

	function ($scope, Authentication) {
		// Expose the authentication service
		//$scope.name = Authentication.user ? Authentication.user.fullName : 'MEAN Application';
		$scope.authentication = Authentication;
	}
]);