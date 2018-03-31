profiles = {
  default: {
    MultiEnvironnment: {
      params: {
        currentState: [
          ExpressEnvironment: {
          port: 8378,
          static_addr: undefined,
          command: "ping -c 1 localhost",
          interval: 200000,
          killAfter: 2
        ]
      }
    },

    },
    RequestDetector: {
      name: "My Detectors Route",
      route: "/config/detectors",
      callback: "GetMotionDetectors"
    },
	  SlackNotifier: {
	    name: "My Slack channel",
	    key: "https://hooks.slack.com/services/<MySlackURL>"
	  },
    SystemEnvironmentFilter: [
    {
      freeMemBelow: 300000,
      applyTo: ["My Detectors Route", "My route for detectors"],
      stdoutMatchesRegex: "Will never match this value"
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;