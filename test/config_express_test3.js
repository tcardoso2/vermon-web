profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8777    
    },
    RequestDetector: {
      name: "My Detectors Route",
      route: "/config/detectors3",
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