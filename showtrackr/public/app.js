angular.module('MyApp', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap'])
	.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

		$locationProvider.html5Mode(true);
		/*
			What is $locationProvider and where does it come from?
			It's a built-in AngularJS service for configuring application linking paths.
			Using this service you can enable HTML5pushState or change URL prefix from #
			to something like #!, which you will need to do if you are planning to use
			Disqus comments in your AngularJS application.  Simply by adding $locationProvider
			parameter to the config's callback function is enough to tell AngularJS to
			inject that service and make it available

		*/

		$routeProvider
			.when('/', {
				templateUrl: 'views/home.html',
				controller: 'MainCtrl'
			})
			.when('/shows/:id', {
				templateUrl: 'views/detail.html',
				controller: 'DetailCtrl'
			})
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/signup', {
				templateUrl: 'views/signup.html',
				controller: 'SignupCtrl'
			})
			.when('/add', {
				templateUrl: 'views/add.html',
				controller: 'AddCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
}]);