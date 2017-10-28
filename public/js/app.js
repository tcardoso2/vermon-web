// Define the `t-motion-detector` module
var tMotionDetector = angular.module('t-motion-detector', []);

// Define the `MotionDetectorController` controller on the `t-motion-detector` module
tMotionDetector.controller('MotionDetectorController', function MotionDetectorController($scope, $http) {
  $scope.getValues = function(){
	$http.get('/config/detectors').then(function(response) {
	  $scope.detectors = response.data;
	});
  }
  $scope.toggleActive = function(detector){
  	let req = {
  	  method: 'POST',
  	  url: '/config/detectors/' + (detector._isActive ? 'deactivate' : 'activate'),
  	  data: { name: detector.name }
  	}
    $http(req).then(function(response) {
      console.log("Received response:", response);
      $scope.getValues();
    });
  }
  $scope.getValues();
});

// Define the `NotifierController` controller on the `t-motion-detector` module
tMotionDetector.controller('NotifierController', function NotifierController($scope, $http) {
  $http.get('/config/notifiers').
    then(function(response) {
      $scope.notifiers = response.data;
    });
});