var senseEntry = angular.module('senseEntry', []);

function mainController($scope, $http) {
  $scope.formData = {};
  
  $http.get('/api/sense_entries')
    .success(function(data) {
	  $scope.sense_entries = data;
	  console.log(data);
	})
	.error(function(data) {
	  console.log('Error: ' + data);
	});
	
	$scope.createSenseEntry = function() {
	  $http.post('/api/sense_entries', $scope.formData)
	    .success(function(data) {
		  $scope.formData = {};
		  $scope.sense_entries = data;
		  console.log(data);
		})
		.error(function(data) {
		  console.log('Error: ' + data);
		});
	};
}; 