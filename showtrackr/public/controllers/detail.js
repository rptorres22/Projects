angular.module('MyApp')
	.controller('DetailCtrl', ['$scope', '$rootScope', '$routeParams', 'Show', 'Subscription', 
		function($scope, $rootScope, $routeParams, Show, Subscription) {


			/*
				Remember our "Show" service?  By default it has the following methods:
				{
					'get':     {method: 'GET'},
					'save':    {method: 'POST'},
					'query':   {method: 'GET', isArray:true},
					'remove':  {method: 'DELETE'},
					'delete':  {method: 'DELETE'}
				};
	
				We can use "Show.get()" to get a single show and "Show.query()" to get an array of shows
			*/
			Show.get({ _id: $routeParams.id }, function(show) {

				// When we get a response back, we add the show to "$scope" in order to make it available
				// to "detail.html" template.  
				$scope.show = show;

				$scope.isSubscribed = function() {
					return $scope.show.subscribers.indexOf($rootScope.currentUser._id) !== -1;
				};


				/*
					Here is how subsribe/unsubscribe action works:
					1. Current show and current user objects are passed to the "Subscription" service.
					2. Subscription service sends a POST request to etiher "/api/subscript" or
						"/api/unsubscribe" with just the Show ID and User ID.
					3. Server response with 200 OK after updating the MongoDB documents.
					4. Current user is added or removed from the "subscribers" array of the current TV
						show to keep things in sync.
				*/
				$scope.subscribe = function() {
					Subscription.subscribe(show).success(function() {
						$scope.show.subscribers.push($rootScope.currentUser._id);
					});
				};

				$scope.unsubscribe = function() {
					Subscription.unsubscribe(show).success(function() {
						var index = $scope.show.subscribers.indexOf($rootScope.currentUser._id);
						$scope.show.subscribers.splice(index, 1);
					});
				};

				/*
					The "nextEpisode" property is an object of an upcoming episode.  If a show
					is currently airing you will see an alert box with a date when the next
					episode starts.  This "nextEpisode" property uses a built-in Javascript
					"filter()" method to find the next episode from today

					The "filter()" methoc creates a new array with all elements that pass the
					test implemented by the provided callback function.  The "show.episodes"
					is an Array of all episodes for Show.  A "filter()" method goes through 
					each and every episode and chekcs if it passes the following condition
					"new Date(episode.firstAired) > new Date()" and if it passes, that episode
					will be added to a new Array.  At the end we will have either an empty
					Array (no upcoming shows) or potentially multiple episodes in an Array
					(mulitple upcomiong episodes).  We are only interested in the first
					upcoming episode.  And so that explailns "[0]" at the end of the "filter()"
					method.

					We could have used a good old "for" loop, but this is cleaner.
				*/
				$scope.nextEpisode = show.episodes.filter(function(episode) {
					return new Date(episode.firstAired) > new Date();
				})[0];

			});
		}
	]);