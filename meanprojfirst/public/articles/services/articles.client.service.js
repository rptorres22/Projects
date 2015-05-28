// public/articles/services/articles.client.service.js

// Invoke 'strict' JavaScript mode
'use strict';


/*
	 $resource is from angular-resource
	 $resource has three arguments: 
			1: Url: The base URL for the resource endpoints
			2: ParamDefaults: a routing parameter assignment using the article's document _id field
			3: Actions: an actions argument extending the resource methods with
				an update() method that uses the PUT http method.
			4: Options: objects that represent custom options to extend the default
				behavior of $resourceProvider

	The returned ngResource object will have several methods to handle the default
		RESTful resource routes, and it can optionally be extended by custom methods.
		The default resource methods are as follows:

	• get(): This method uses a GET HTTP method and expects a JSON
		object response
	• save(): This method uses a POST HTTP method and expects a JSON
		object response
	• query(): This method uses a GET HTTP method and expects a JSON
		array response
	• remove(): This method uses a DELETE HTTP method and expects a
		JSON object response
	• delete(): This method uses a DELETE HTTP method and expects a
		JSON object response

	Calling each of these methods will use the $http service and invoke an HTTP
	request with the specified HTTP method, URL, and parameters. The $resource
	instance method will then return an empty reference object that will be populated
	once the data is returned from the server. You can also pass a callback function
	that will get called once the reference object is populated. A basic usage of the
	$resource factory method would be as follows:

	var Users = $resource('/users/:userId', {
		userId: '@id'
	});

	var user = Users.get({
		userId: 123
	}, function () {
		user.abc = true;
		user.$save();
	});

	In order for your CRUD module to easily communicate with the API endpoints,
	it is recommended that you use a single AngularJS service that will utilize the
	$resource factory method.

	Notice how the service uses the $resource factory with three arguments: the base
	URL for the resource endpoints, a routing parameter assignment using the article's
	document _id field, and an actions argument extending the resource methods with
	an update() method that uses the PUT HTTP method. This simple service provides
	you with everything you need to communicate with your server endpoints.
 
*/

// Create the 'articles' service
angular.module('articles').factory('Articles', ['$resource', 
	function ($resource) {
		// Use the '$resource' service to return an article '$resource' object
		return $resource('api/articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
	});
}]);