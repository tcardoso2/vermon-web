profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8777    
    },
  	PIRMotionDetector: {
      pin: 17
    },
    RequestDetector: {
      name: "My Detectors Route",
      route: "/config/detectors2",
      callback: "GetMotionDetectors"
    },
	  SlackNotifier: {
	    name: "My Slack channel",
	    key: "https://hooks.slack.com/services/<MySlackURL>"
	  }
  }
}

exports.profiles = profiles;
exports.default = profiles.default;