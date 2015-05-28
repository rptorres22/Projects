// public/articles/controllers/articles.client.controller.js

// Invoke 'strict' JavaScript mode
'use strict';

/*
	$routeParams: This is provided with the ngRoute module and holds references to route 
					parameters of the AngularJS routes

	$location: This allows you to control the navigation of your application

	Authentication: We created this service that provides us with the authenticated user information

	Articles: We created this service that provides us with a set of methods to communicate with RESTful endpoints
*/

// Create the 'articles' controller
angular.module('articles').controller('ArticlesController', ['$scope', '$routeParams', '$location', 'Authentication', 'Articles',
	
	function ($scope, $routeParams, $location, Authentication, Articles) {

		// Expose the Authentication service
		// binding the Authentication service to the $scope object so that views will be able to use it as well
		$scope.authentication = Authentication;

		// Create a new controller method for creating new articles
		$scope.create = function () {
			
			// Use the form fields to create a new article $resource object
			//Articles resource service to create a new article resource
			var article = new Articles({
				//comes from title and content form fields in $scope
				//this will get passed to req.body in the server's articles controller
				title: this.title,
				content: this.content
			});

			// use article resource $save() method to send the new article object
			// to the corresponding RESTful endpoint along with two callbacks.
			// first callback will be executed when the server responds with a success (200) status code
			//	then will use the $location service to navigate to the route
			// second callback will be executed when the server responds with an error status code 
			article.$save(
				function (response) {
					$location.path('articles/' + response._id);
				}, 
				function (errorResponse) {
					$scope.error = errorResponse.data.message;
				}
			);

		};

		// Create a new controller method for retrieving a list of articles
		// this uses the resource query() method because it expects
		// a collection
		$scope.find = function () {
			// Use the article 'query' method to send an appropriate GET request
			$scope.articles = Articles.query();
			console.log($scope.articles);
		};

		// Create a new controller method for retrieving a single article
		// retreive a single article based on the articleId route parameter
		// 	which the function obtains directly from the URL
		// 	expects a single document
		$scope.findOne = function() {
			// Use the article 'get' method to send an appropriate GET request
			$scope.article = Articles.get({
				articleId: $routeParams.articleId
			});
		};


		// Create a new controller method for updating a single article
		// update an existing article
		// 	using the article's $update() method to send the updated
		// 	article object to the corresponding RESTful endpoint, along
		// 	with two callbacks
		$scope.update = function() {
			// Use the article '$update' method to send an appropriate PUT request
			$scope.article.$update(
				function () {
					// If an article was updated successfully, redirect the user to the article's page
					$location.path('articles/' + $scope.article._id);
				}, 
				function (errorResponse) {
					// Otherwise, present the user with the error message
					$scope.error = errorResponse.data.message;
				}
			);
		};

		// Create a new controller method for deleting a single article
		// First figure out whether the user is deleting an article from
		// 	a list or directly from the article view.  It will then use
		// 	the article's $remove() method to call the corresponding RESTful endpoint
		// 	if the user deleted the article form a list view, it will then remove the 
		// 	deleted object from the articles collection; otherwise, it will
		// 	delete the article then redirect the user back to the list view
		$scope.delete = function (article) {
			// If an article was sent to the method, delete it
			if (article) {
				// Use the article '$remove' method to delete the article
				article.$remove(function () {
					// Remove the article from the articles list
					for (var i in $scope.articles) {
						if ($scope.articles[i] === article) {
							$scope.articles.splice(i, 1);
						}
					}
				});
			} else {
				// Otherwise, use the article '$remove' method to delete the article
				$scope.article.$remove(function () {
					$location.path('articles');
				});
			}
		};





	}
]);