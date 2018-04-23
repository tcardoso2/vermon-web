let m = require('t-motion-detector');
let ent = m.Entities;
var log = m.Log;
let ext = m.Extensions;
let express = require('express');
let bodyParser = require('body-parser');
let path = require("path");
let app;
const defaultPort = 8080;
let ko = require("knockout");

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
    this.port = port && Number.isInteger(port) ? port : defaultPort;
    this.static_addr = static_addr ? static_addr : path.join(__dirname, '/public'); 
    this.maxAttempts = maxAttempts;
    this.name = "Express Environment";
    app = express();
    //Handle errors
    if(listen) this.listen();
  }

  setBodyParser(){
    //parse application/json and look for raw text
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.text());   
    app.use(bodyParser.json({ type: 'application/json'}));
  }

  listenNext(){
    log.error(`Some error happened while attempting to listen to port ${this.port}, attempting next port...`);
    this.port++;
    this.listen();
  }

  listen()
  {
    log.info(`Setting static address to ${this.static_addr}...`);
    app.use(express.static(this.static_addr));
    
    let e = this;
    app.get("/welcome", (req, res) => {
      e.addChange(req.url);
      res.json({message: "Welcome to T-Motion-CLI Web server!"});
    });
    this.setBodyParser();
    this.maxAttempts--;
    if(this.maxAttempts > 0){
      log.info(`Attempting to listen to port ${this.port}`);
      this.server = app.listen(this.port).on('error', this.listenNext);
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
  bindDetector(md, notifiers, force = false){

    super.bindDetector(md, notifiers, force);
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
    log.info("Server will stop listening...");
    if(this.server){
  	  this.server.close();
      log.info("Server closed.");
    }
  }

  kill()
  {
    this.stop();
    app = {};
  }
}

//This controls the Json output of the BaseNotifier class, not printing
//unecessary members
ExpressEnvironment.prototype.toJSON = function() {
  let copy = ko.toJS(this); //easy way to get a clean copy
  let props = Object.getOwnPropertyNames(copy);
  for (let i in props){
    if (props[i].startsWith("_"))
    {
      delete copy[props[i]];
    }
  }
  delete copy.domain; //remove an extra property
  return copy; //return the copy to be serialized
};

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
      //Adds a default truthy node
      this.addNode(new DecisionNodeDetector("Default Node", ()=>{ return true }));
    }
  }

/**
 * Adds a node if is less than the limit.
 * @returns true if the node was successfully added.
 */
  addNode(node, truthy = true){
    if(node && (node instanceof DecisionNodeDetector)){
      if(this.nodes.length < MAX_NODES){
        //If a node already exists will add it as left/right
        if (this.nodes.length > 0){
          if(truthy){
            this.getLastNode().goToIfTrue(node);
          } else {
            this.getLastNode().goToIfFalse(node);
          }
        } 
        this.nodes.push(node);
        return true;
      }
      return false;
    } else{
      throw new Error("ERROR: Parameter of 'addNode' method must be of instance DecisionNodeDetector.");
    }
    //Also adds as Detector
    super.bindDetector(node);
  }
  getLastNode(){
    return this.nodes[this.nodes.length-1];
  }

/**
 * Gets the number of nodes.
 * @returns {Int} the number of nodes of the decision tree.
 */
  countNodes(){
    return this.nodes.length;
  }

  processTree(){
    //Starts with the first node;
    let first_node = this.nodes[0];
    let next = first_node;
    let path = [];
    let result = { value: {} };
    log.info("Starting to process tree...");
    while(!next.isLast())
    {
      log.info(`  '${next.descriptor}' has child nodes. Processing node...`); 
      result = next.process();
      log.info(`  result is ${result}'.`); 
      next = result.next;
      path.push(result.step);
    }
    log.info(`Finished processing tree. Emiting decision node '${next.descriptor}', ${result.value}`);
    this.emit("decision", result.value, next, path);
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
    this.setHandler(handler);
  }
  setHandler(handler){
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

/**
 * DecisionNode is a Node inside the DecisionTreeEnvironment class. It is a special type of Detector with
 * Additional functions to support decisions.
 */
class DecisionNodeDetector extends ent.MotionDetector{
  
  constructor(descriptor, fn){
    if(!descriptor){
      throw new Error("ERROR: First parameter of DecisionNode should describe the assertion as a string.");
    }
    super(descriptor);
    if(typeof(fn) != "function"){
      throw new Error("ERROR: Second parameter of DecisionNode should be a function which executes the assertion.");
    }
    this.fn = fn;
    this.descriptor = descriptor;
    //Next node
    this.nextLeft; //Truthy node
    this.nextRight; //Falsy node
  }

  goToIfTrue(node){
    this.nextLeft = node;
  }

  goToIfFalse(node){
    this.nextRight = node;
  }

/**
 * Processes the decision based on the goToIf<True><False> Functions provided
 */
  process(){
    let result = {
      next: this.fn() ? this.nextLeft : this.nextRight,
      value: this.fn(),
      step: this.fn() ? `(TRUE) -> ${this.nextLeft.descriptor}` :  "(FALSE) -> ${this.nextRight.descriptor}"
    }
    if (result.value === undefined) throw new Error(`No node was defined as result, please add a decision node: Left: ${this.nextLeft}, Right: ${this.nextRight}`);
    return result;
  }
/**
 * Returns true if there are no left not right Next nodes
 */
  isLast(){
    return !(this.nextLeft || this.nextRight);
  }
}
/*
 * Creates an API Environment which retrieves a local key/secret and endpoint
 */
class APIEnvironment extends ext.SystemEnvironment{
  
  constructor(key, secret, endpoint, isMockMode){
    super("echo Starting APIEnvironment...");
    this.setAPIKey(key);
    this.setAPISecret(secret);
    this.setEndPoint(endpoint);
    this._isMockMode = isMockMode;
    this._bulkResults = [];
  }

  setEndPoint(endpoint){
    this._endpoint = endpoint;
  }

  setAPIKey(key){
    this._key = key;
  }

  setAPISecret(secret){
    this._secret = secret;
  }
 /**
 * Sets mock mode, allowing offline testing
 * @param {boolean} mode allows setting the mode to true or false - by default is false;
 */
  setMockMode(mode){
    this._isMockMode = mode;
  }

 /**
 * Returns the data
 * @param {number} src is the file path
 * @example 
 * @returns the schema, should be overriden by the sub-classes
 */
  getData(data, callback, endpoint_fragment = "undefined"){
    let _url = this._constructEndPoint(endpoint_fragment, data);
    this._request(_url, (err, response, body) => {
      callback(err, this._transformRawResponse(body), body);
    });
  }
  /**
  * Transforms the middleware raw response into the expected format
  */
  _transformRawResponse(raw){
    throw new Error("'_transformRawResponse' function, must be implemented by child classes.");
  }

  _request(endpoint, callback){
    //Checks if it is in mock mode
    console.log(">>> Starting request, checking if it is in Mock Mode...");
    if(this._isMockMode){
      this._mockRequest(callback);
    }
    else{
      request(`${endpoint}`, { json: true }, (err, response, body) => {
      if (err) { return console.log(err); }
      callback(err, response, body);
      });
    }
  }

  /**
  * Generates a response via mock - used e.g. for offline testing
  */
  _mockRequest(callback){
    throw new Error("_mockRequest should be implemented by child classes.");
  }
  /**
  * Constructs an endpoint based on a given key - should be overriden by shild classes
  * @param {String} key is some generic identifier which determines the format of the URL
  * @param {Object} value must be an object. The function will inject into that object the 'api_key' attribute 
  */
  _constructEndPoint(key, value){
    this._query = {
      url: "/" + value.id,
      key: key,
      value: value
    }
    value.api_key = this._key;
    return endpoints.format(this._endpoint, value);
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
const classes = { CommandStdoutDetector, ExpressEnvironment, RequestDetector, APIEnvironment };

new ent.EntitiesFactory().extend(classes);

exports.CommandStdoutDetector = CommandStdoutDetector;
exports.DecisionNodeDetector = DecisionNodeDetector;
exports.defaultPort = defaultPort;
exports.ExpressEnvironment = ExpressEnvironment;
exports.DecisionTreeEnvironment = DecisionTreeEnvironment;
exports.APIEnvironment = APIEnvironment;
exports.RequestDetector = RequestDetector;