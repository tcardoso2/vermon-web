profiles = {
  default: {
  	Environment: {
    },
    CommandStdoutDetector: {
      name: "My detector",
      command: "node main",
      args: ["startweb, defaultConfig"],
      pattern: "INFO   Starting web server"
    },
	  BaseNotifier: {
	  }
  }
}

exports.profiles = profiles;
exports.default = profiles.default;