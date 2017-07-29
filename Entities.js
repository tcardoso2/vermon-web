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
  	  console.log(`Adding route: ${md.route} with verb: ${md.verb}`);
      switch (md.verb)
      {
  	    case "GET": 
          app.get(md.route, (req, res) => {
    	  	  md.send(req.url, e);;
    	  	  md.handler(req, res);
  	      });
          break;
        case "POST":    
          app.post(md.route, (req, res) => {
            md.send(req.url, e);;
            md.handler(req, res);
          });
          break;
        default:
          throw new Error (`Verb ${md.verb} is not implemented.`)
          break;
      }
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
  constructor(name, route, handler, verb){
  	super(name);
  	this.route = route;
    this.verb = verb ? verb : "GET";
    if (typeof handler == "string"){
      let parts = _GetFuncParts(handler);
  	  this.handler = (req, res)=> {
        console.log(`Request body: ${req.body} \nExecuting function main.${parts[0]}...`)
        try{
          let result = _GetFuncResult(parts[0], req.body ? req.body[parts[1]] : undefined); //Do not put as parts
          let cache = []; //This is a method of avoiding circular reference error in JSON
          res.json(JSON.parse(JSON.stringify(result ? result : {}, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
          })));
          cache = null; // Enable garbage collection
        }catch(e){
          console.error(`Error: ${e.message}`);
          res.json(e.message);
        }
      };
    } else {
      this.handler = handler;
    }
  }
}

//Given the configuration handler portion, separates into the function and arguments name and verifies if
//the function really exists
function _GetFuncParts(fn_name){
  let funcParts = fn_name.split(";");
  console.log(`Checking if function ${funcParts} exists...`)
  let func = m[funcParts[0]];
  if (!func) throw new Error(`Error: function "${fn_name}" is not defined in t-motion-detector.`);
  return funcParts;
}

//Executes a function with name fn_name in the main t-motion-detector module and passes its args
function _GetFuncResult(fn_name, args){
  console.log(`Calling function ${fn_name}(${args})...`)
  return m[fn_name](args);
}

//Extending Entities Factory
const classes = { ExpressEnvironment, RequestDetector };

new ent.EntitiesFactory().extend(classes);

exports.ExpressEnvironment = ExpressEnvironment;
exports.RequestDetector = RequestDetector;