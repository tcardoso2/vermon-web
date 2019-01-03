profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8276,
      static_addr: undefined,
      command: 'ping -c 1 localhost',
      interval: 0    
    },
    RequestDetector: {
      name: 'My Detector Activator Post Route',
      route: '/config/detector4/',
      callback: 'ActivateDetector'
    },
	  SlackNotifier: {
	    name: 'My Slack channel',
	    key: 'https://hooks.slack.com/services/<MySlackURL>'
	  },
    SystemEnvironmentFilter: [
      {
        freeMemBelow: 0,
        applyTo: 'My Detector Activator Post Route',
        stdoutMatchesRegex: '1 packets transmitted, 1 packets received, 0.0% packet loss'
      }]
  }
}

exports.profiles = profiles
exports.default = profiles.default