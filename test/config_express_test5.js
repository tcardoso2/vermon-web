profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8276,
      static_addr: undefined   
    },
    RequestDetector: {
      name: 'My System Environment route',
      route: '/config/environment/',
      callback: 'GetEnvironment'
    },
	  BaseNotifier: {
	    name: 'My Notifier'
	  }
  }
}

exports.profiles = profiles
exports.default = profiles.default