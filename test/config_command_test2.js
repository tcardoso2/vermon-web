profiles = {
  default: {
  	Environment: {
    },
    CommandStdoutDetector: {
      name: 'My detector',
      command: 'node main',
      args: ['startweb, defaultConfig'],
      pattern: '##  STARTING WEB SERVER on port 3300... ##'
    },
	  BaseNotifier: {
	  }
  }
}

exports.profiles = profiles
exports.default = profiles.default