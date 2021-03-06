profiles = {
  default: {
    ExpressEnvironment: {
      port: 8378,
      static_addr: undefined,
      maxAttempts: 2
    },
    RequestDetector: {
      name: 'My Detectors Route',
      route: '/config/detectors',
      callback: 'GetMotionDetectors'
    },
	  SlackNotifier: {
	    name: 'My Slack channel',
	    key: 'https://hooks.slack.com/services/<MySlackURL>'
	  }
  }
}

exports.profiles = profiles
exports.default = profiles.default
