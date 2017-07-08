// Define the `t-motion-detector` module
var tMotionDetector = angular.module('t-motion-detector', []);

// Define the `MotionDetectorController` controller on the `t-motion-detector` module
tMotionDetector.controller('MotionDetectorController', function MotionDetectorController($scope, $http) {
  $http.get('/config/detectors').
    then(function(response) {
      $scope.detectors = response.data;
    });
});

// Define the `NotofierController` controller on the `t-motion-detector` module
tMotionDetector.controller('NotifierController', function NotifierController($scope, $http) {
  $http.get('/config/notifiers').
    then(function(response) {
      $scope.notifiers = response.data;
    });
});