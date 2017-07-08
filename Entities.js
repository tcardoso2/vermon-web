let m = require('t-motion-detector');
let ent = m.Entities;
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
const defaultPort = 8080;

/*
 * Wraps an Express web-server. See more in
 * https://expressjs.com/en/api.html
 * Acts like a Singleton, in the sense that the wrapped express app is a single instance
 */
class ExpressEnvironment extends ent.Environment{
  
  constructor(port){
    super();
    this.port = port ? port : defaultPort;
    //Sets up a default route
    app.use(express.static('public'));
    let e = this;
    app.get("/welcome", (req, res) => {
      e.addChange(req.url);
      res.json({message: "Welcome to T-Motion-CLI Web server!"});
    });

    this.server = app.listen(this.port);
  }
  
  setStatic(path)
  {
  	app.use(express.static(path));
  }

  /* Gets a reference to the express web-app */
  getWebApp()
  {
    return app;
  }

  //Only when Detector is binded, it is added to the app
  bindDetector(md, notifiers){

    super.bindDetector(md, notifiers);
    let e = this;
  	if(md instanceof RequestDetector) {
  	  console.log("Adding route: ", md.route);
  	  app.get(md.route, (req, res) => {
  	  	md.send(req.url, e);;
  	  	md.handler(req, res);
  	  });
  	}
  }

  getPort()
  {
  	return this.port;
  }

  stop()
  {
  	//Do some closing steps here.
  	this.server.close();
  }
}

class RequestDetector extends ent.MotionDetector{
  constructor(name, route, handler){
  	super(name);
  	//app.get(route, handler);
  	this.route = route;
  	this.handler = handler;
  }
}

//Extending Entities Factory
const classes = { ExpressEnvironment, RequestDetector };

new ent.EntitiesFactory().extend(classes);

exports.ExpressEnvironment = ExpressEnvironment;
exports.RequestDetector = RequestDetector;