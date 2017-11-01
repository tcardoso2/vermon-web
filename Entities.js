let m = require('t-motion-detector');
let ent = m.Entities;
var log = m.Log;
let ext = m.Extensions;
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let path = require("path");

const defaultPort = 8080;

/**
 * Wraps an Express web-server, which will allow viewing all the Motion Detectors and
 * Notifiers in the system. See more in
 * https://expressjs.com/en/api.html
 * Acts like a Singleton, in the sense that the wrapped express app is a single instance
 * @param {integer} port is the port of the web-app, if not provided, will default to 8080.
 * @param {string} static_addr, is the relative URL of the static resources, it defaults to the 
 * module's internal public folder
 * @example  let web = require("t-motion-detector-cli");
let config = new web._.Config('./config.js');
web._.StartWithConfig(config, (e,d,n,f)=>{
  console.log("Good to go!");
});
//Example of a config file which creates the routes necessary

profiles = {
  default: {
    ExpressEnvironment: {
      port: 8777
    },
    RequestDetector: [{
      name: "My Detectors Route",
      route: "/config/detectors",
      callback: "GetMotionDetectors"
    },
    {
      name: "My Notifiers Route",
      route: "/config/notifiers",
      callback: "GetNotifiers"
    },
    {
      name: "Activate route",
      route: "/config/detector/activate",
      callback: "ActivateDetector;name",
      verb: "POST"
    },
    {
      name: "Deactivate route",
      route: "/config/detector/deactivate",
      callback: "DeactivateDetector;name",
      verb: "POST"
    }]
  }
}
exports.profiles = profiles;
exports.default = profiles.default;
 */
class ExpressEnvironment extends ext.SystemEnvironment{
  
  constructor(port, static_addr, command = "pwd", interval = 10000, maxAttempts = 10, listen = true){
    super(command, interval);
    this.port = port ? port : defaultPort;
    this.static_addr = static_addr ? static_addr : path.join(__dirname, '/public'); 

    log.info(`Setting static address to ${this.static_addr}...`);
    app.use(express.static(this.static_addr));
    
    let e = this;
    app.get("/welcome", (req, res) => {
      e.addChange(req.url);
      res.json({message: "Welcome to T-Motion-CLI Web server!"});
    });
    this.maxAttempts = maxAttempts;
    this.port--;
    if(listen) this.listen();
  }

  listen()
  {
    this.port++;
    this.maxAttempts--;
    if(this.maxAttempts > 0){
      log.info(`Attempting to listen to port ${this.port}`);
      this.server = app.listen(this.port).on('error', this.__listen);
      log.info("Listening to port successful.");
    }
  }
  
  setStatic(path)
  {
  	app.use(express.static(path));
  }

  getStaticAddr()
  {
    return this.static_addr;
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
  	  log.info(`Adding route: ${md.route} with verb: ${md.verb}`);
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
    if(this.server){
  	  this.server.close();
    }
  }
}

/**
 * Max number of nodes on the Decision Tree
 */
const MAX_NODES = 100;
/**
 * A Decision Tree environment which keeps a decision tree internally and sends changes when state changes
 */
class DecisionTreeEnvironment extends ent.Environment{
  
  constructor(numberNodes){
    super();
    if(!numberNodes){
      throw new Error("ERROR: Number of nodes is mandatory and cannot equal 0.");
    }
    if(isNaN(numberNodes)){
      throw new Error("ERROR: Number of nodes must be a number.");
    }
    if((numberNodes < 1) || (numberNodes > 100) ){
      throw new Error(`ERROR: Number must be between 1-${MAX_NODES}`);
    }

    this.nodes = [];
    
    while(numberNodes > 0){
      numberNodes--;
      this.addNode(1);
    }
  }

/**
 * Adds a node if is less than the limit.
 * @returns true if the node was successfully added.
 */
  addNode(node){
    if(this.nodes.length < MAX_NODES){
      this.nodes.push(1);
      return true;
    }
    return false;
  }
/**
 * Gets the number of nodes.
 * @returns {Int} the number of nodes of the decision tree.
 */
  countNodes(){
    return this.nodes.length;
  }
}

/**
 * A Detector which takes a line command and will send a change if detects the pattern given on stdout
 * @param {String} name is a friendly name for reference for this route, will be the detector name.
 * @param {String} command will be executed by the command line
 * @param {Array} args is an array of arguments for the command to execute
 * @param {String} pattern is a pattern which the detector will attempt to find in the log, by default it searches for "ERROR"
 */
class CommandStdoutDetector extends ent.MotionDetector{
  constructor(name, command, args = [], pattern = "ERROR"){
    super(name);
    //Validate 2nd argument
    if (!command){
      throw new Error("The second argument 'command' is mandatory.");
    }
    //Validate 3rd argument
    if(!Array.isArray(args)){
      throw new Error("The third argument 'args' must be an Array.");
    }
    this.command = command;
    this.args = args;
    this.pattern = pattern;
  }

  startMonitoring(){
    super.startMonitoring();
    let _args = '';
    for (let i in this.args){
      _args += ` --${this.args[i]}`;
    }
    let data_line = '';
    let line = 0;
    log.info(`Executing command: "${this.command} ${this._args}"...`);
    this.processRef = m.Cmd.get(this.command + _args);
    let d = this;
    this.processRef.stdout.on(
      'data', (data)=> {
        line++;
        data_line += data;
        if (data_line[data_line.length-1] == '\n') {
          if (data.indexOf(d.pattern) > 0){
            log.info(`Pattern detected by ${d.name} on line ${line}, sending change to notifiers....`);
            d.send({ "line": data, "row": line, "col": data.indexOf(d.pattern), "allData": data_line });
          }
        }
      }
    );
  }
}
/**
 * A Web Request Detector which implements an URL route to some known available serve-moethod.
 * @param {String} name is a friendly name for reference for this route, will be the detector name.
 * @param {String} route an URL route
 * @param {String} handler is the name of the method / function to call when this route is used, the function's return contents are displayed as a Web Response.
 * @param {String} verb is the HTTP Verb to be used, if ommited defaults to "GET".
 * @example
 * new RequestDetector("Get Notifiers route", "/config/notifiers", "GetNotifiers");
 * //GET route which calls the GetNotifiers function
 * new RequestDetector("Deactivate Detectors route", "/config/detectors/deactivate", "DeactivateDetector;name", "POST");
 * //POST request route. in this case expects in the query string a "name" argument which should refer the name of the detector to deactivate e.g.
 * ///config/detectors/deactivate?name=MyDetectorToDeactivate
 */
class RequestDetector extends ent.MotionDetector{
  constructor(name, route, handler, verb = "GET"){
  	super(name);
  	this.route = route;
    this.verb = verb;
    if (typeof handler == "string"){
      let parts = _GetFuncParts(handler);
  	  this.handler = (req, res)=> {
        log.info(`Request body: ${JSON.stringify(req.body)} \nExecuting function main.${parts[0]}...`)
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
          log.error(`Error: ${e.message}`);
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
  log.info(`Checking if function ${funcParts} exists...`)
  let func = m[funcParts[0]];
  if (!func) throw new Error(`Error: function "${fn_name}" is not defined in t-motion-detector.`);
  return funcParts;
}

//Executes a function with name fn_name in the main t-motion-detector module and passes its args
function _GetFuncResult(fn_name, args){
  log.info(`Calling function ${fn_name}(${args})...`)
  return m[fn_name](args);
}

//Extending Entities Factory
const classes = { CommandStdoutDetector, ExpressEnvironment, RequestDetector };

new ent.EntitiesFactory().extend(classes);

exports.CommandStdoutDetector = CommandStdoutDetector;
exports.ExpressEnvironment = ExpressEnvironment;
exports.DecisionTreeEnvironment = DecisionTreeEnvironment;
exports.RequestDetector = RequestDetector;