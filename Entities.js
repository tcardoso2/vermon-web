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
class ExpressNotifier extends ent.BaseNotifier{
  

  constructor(name, port){
    super(name);
    this.port = port ? port : defaultPort;
    //Sets up a default route
    app.get("/", (req, res) => res.json({message: "Welcome to T-Motion-CLI Web server!"}));
    app.listen(this.port);
  }
  
  /* Gets a reference to the express web-app */
  getWebApp()
  {
    return app;
  }

  getPort()
  {
  	return this.port;
  }

  notify(some_text, oldState, newState, detector)
  {
    this.lastMessage = some_text;
    this.data = {
      "oldState": oldState,
      "newState": newState,
      "detector": detector
    };
  }

  stop()
  {
  	app.close();
  }
}

exports.ExpressNotifier = ExpressNotifier;