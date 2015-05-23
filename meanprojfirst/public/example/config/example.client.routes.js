// /public/example/example.client.routes.js

/*
	ngRoute module has several key entities to manage routes.  
	One of them is $routeProvider; this will provide methods
	to define your AngularJS app routing behavior.
*/


//configuring the 'example' module to use $routeProvider from ngRoute
angular.module('example').config(['$routeProvider', 
	function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'example/views/example.client.view.html'
			}).
			otherwise({
				redirectTo: '/'
			});
	}
]);