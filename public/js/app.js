// Define the `t-motion-detector` module
var tMotionDetector = angular.module('t-motion-detector', []);

// Define the `MotionDetectorController` controller on the `t-motion-detector` module
tMotionDetector.controller('MotionDetectorController', function MotionDetectorController($scope) {
  $scope.detectors = [
    {
      name: 'Detector 1',
      snippet: 'Some description 1'
    }, {
      name: 'Detector 2',
      snippet: 'One more description, this time for 2'
    }, {
      name: 'Detector 3',
      snippet: 'Guess what? Description for the 3rd one :)'
    }
  ];
});