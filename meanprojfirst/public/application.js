// public/application.js


// this is manually bootstrapping the AngularJS application
// instead of hard coding the ng-app directive into an html tag
// we will do it this way

var mainApplicationModuleName = 'mean';


// where we add dependencies
// make sure these have been added by <script> tags in the ejs/view file in app/views
//	before the application.js has been loaded and after angular.js has been loaded 

/*
	Dependencies:

	'example' - this is the example feature
	'ngRoute' - this is angular-route
	'users' - this is the users feature
	'ngResource' - this is angular-resource that provides an easy way to communite with RESTful data source
	'articles' - this is the articles feature
*/

var mainApplicationModule = angular.module(mainApplicationModuleName, 
	['ngResource', 'ngRoute', 'users', 'example', 'articles', 'chat']);





/*
	This is to help search engine crawlers to mark the application
	as a single-page application.  That way, the search engine crawlers know
	your application is using AJAX to render new paths and can wait for the result
	before it leaves your page.  

	To mark your app routes as single-page app routes, you will need to use a
	routing scheme called Hashbangs.  These are implemented like:
		http://localhost:3000/#!/example.

	AngularJS supports Hasbangs by using $locationProvider 
*/
mainApplicationModule.config(['$locationProvider', 
	function ($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);


// to solve Facebook's redirect bug that adds a hash part to the application's URL
//	after OAuth authentication round-trip.
if (window.location.hash === '#_=_') 
	window.location.hash = '#!';


angular.element(document).ready(function() {
	angular.bootstrap(document, [mainApplicationModuleName]);
});