profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8777    
    },
    NetworkDetector: {
      name: "My Network Detector",
    },
	  BaseNotifier: {
	    name: "My Notifier",
	  }
  }
}

exports.profiles = profiles;
exports.default = profiles.default;