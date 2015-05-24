// public/articles/services/articles.client.service.js


/*
 $resource is from angular-resource
 $resource has three arguments: 
		1: The base URL for the resource endpoints
		2: a routing parameter assignment using the article's document _id field
		3: an actions argument extending the resource methods with
			an update() method that uses the PUT http method.
*/
angular.module('articles').factory('Articles', ['$resource', 
	function ($resource) {
		return $resource('api/articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
	});
}]);