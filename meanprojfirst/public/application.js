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
*/

var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngRoute', 'example']);





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
		$locationProvider.hashPrefix('!')''
	}
]);

angular.element(document).ready(function() {
	angular.bootstrap(document, [mainApplicationModuleName]);
});