profiles = {
  default: {
    MultiEnvironment: {
      params: {
        name: "My MultiEnvironment",
        state: [
          {
            $new$ExpressEnvironment: {
              port: 8380,
              static_addr: undefined,
              command: "ping -c 1 localhost",
              interval: 200000
            }
          },
          {
            $new$Environment: {
              params: {
                name: "Environment 2",
                state: 3
              }
            }
          }
        ]
      }
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
