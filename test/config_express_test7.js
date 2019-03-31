profiles = {
  default: {
    MultiEnvironment: {
      params: {
        name: 'My MultiEnvironment',
        state: [
          {
            $new$ExpressEnvironment: {
              port: 8380
            }
          },
          {
            $new$Environment: {
              params: {
                name: 'Environment 2',
                state: 3
              }
            }
          }
        ]
      }
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
