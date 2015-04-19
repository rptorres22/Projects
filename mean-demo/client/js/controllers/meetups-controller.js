app.controller('meetupsController', ['$scope', '$resource', function($scope, $resource){

	var Meetup = $resource('/api/meetups');

// hardcoded data
//	$scope.meetups = [
//		{ name: "MEAN SF Developers" },
//		{ name: "Some other meetup" },
//	]
	
	Meetup.query(function (results) {
		$scope.meetups = results;
	});


	$scope.createMeetup = function(){
		//modifying hardcoded data
		//$scope.meetups.push({name: $scope.meetupName});
		//$scope.meetupName = '';

		var meetup = new Meetup();
		meetup.name = $scope.meetupName;
		meetup.$save(function (result) {
			$scope.meetups.push(result);
			$scope.meetupName = '';
		});

	}

}]);
