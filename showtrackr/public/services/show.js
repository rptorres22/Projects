/*
	Simple service due to the "angular-resource.js" module
	The "$resource" service is the perfect companion for a
	RESTful backend.  This is all we need to query all shows
	and an individual "show by id".
*/

angular.module('MyApp')
	.factory('Show', ['$resource', function($resource) {
		return $resource('/api/shows/:_id');
	}]);