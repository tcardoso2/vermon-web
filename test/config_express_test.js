profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8716      
    },
  	PIRMotionDetector: {
      pin: 17
    },
    RequestDetector: {
      name: "My Detectors Route",
      route: "/config/detectors1",
      callback: (req, res)=>{ res.json({ some: "content" }); }
    },
	  SlackNotifier: {
	    name: "My Slack channel",
	    key: "https://hooks.slack.com/services/<MySlackURL>"
	  }
  }
}

exports.profiles = profiles;
exports.default = profiles.default;