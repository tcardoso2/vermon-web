profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8276,
      static_addr: undefined
    },
    RequestDetector: {
      name: 'My Detector Activator Post Route',
      route: '/config/detector4/',
      callback: 'ActivateDetector'
    },
	  SlackNotifier: {
	    name: 'My Slack channel',
	    key: 'https://hooks.slack.com/services/<MySlackURL>'
	  }
  }
}

exports.profiles = profiles
exports.default = profiles.default