// public/application.js


// this is manually bootstrapping the AngularJS application
// instead of hard coding the ng-app directive into an html tag
// we will do it this way

var mainApplicationModuleName = 'mean';


// where we add dependencies
// make sure these have been added by <script> tags in the ejs/view file in app/views
//	before the application.js has been loaded and after angular.js has been loaded 
var mainApplicationModule = angular.module(mainApplicationModuleName, ['example']);

angular.element(document).ready(function() {
	angular.bootstrap(document, [mainApplicationModuleName]);
});