angular.module('MyApp')
	.controller('AddCtrl', ['$scope', '$alert', 'Show', function($scope, $alert, Show) {

		$scope.addShow = function() {
			Show.save(

				{ showName: $scope.showName }, 

				function() {

					$scope.showName = '';
					/*
						Add $setPristine() method to clear the form of any errors after adding
						a Show.  This is to properly clear the form by changing its state from
						$dirty to $pristine.
					*/
					$scope.addForm.$setPristine();
					//"$alert" is part of the AngularStrap library
					$alert({
						content: 'TV show has been added.',
						placement: 'top-right',
						type: 'success',
						duratoin: 3
					});
				},


				//second callback function for handling errors
				function(response) {

					$scope.showName = '';
					$scope.addForm.$setPristine();

					$alert({
						content: response.data.message,
						placement: 'top-right',
						type: 'danger',
						duratoin: 3
					});
				}
			);
		};
		
	}]);