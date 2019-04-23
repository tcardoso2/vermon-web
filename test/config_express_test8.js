profiles = {
  default: {
  	ExpressEnvironment: {
      port: 8276,
      static_addr: undefined   
    },
    RequestDetector: {
      name: 'My test 8 route',
      route: '/config/test8',
      callback: (req, res, env) => {
        console.log("TEST 8 callback!")
        res.json({})
      }
    },
	  BaseNotifier: {
	    name: 'My Notifier'
	  }
  }
}

exports.profiles = profiles
exports.default = profiles.default