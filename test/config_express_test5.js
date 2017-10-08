profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8276,
      static_addr: undefined,
      command: "ping -c 1 localhost",
      interval: 1000    
    },
    RequestDetector: {
      name: "My System Environment route",
      route: "/config/environment/",
      callback: "GetEnvironment"
    },
	  BaseNotifier: {
	    name: "My Notifier"
	  },
    SystemEnvironmentFilter: [
    {
      freeMemBelow: 0,
      applyTo: "My Detector Activator Post Route",
      stdoutMatchesRegex: "1 packets transmitted, 1 packets received, 0.0% packet loss"
    }]
  }
}

exports.profiles = profiles;
exports.default = profiles.default;