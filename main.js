#!/usr/bin/env node
"use strict"

/*******************************************************
 * T-MOTION-DETECTOR-CLI
 * There are 2 ways to use this tool:
 * 1: Via "require" keyword: This Adds the module as a library and allows between others, 
 *    running a server programatically with pre-configured elements via the StartWithConfig function;
 * 2: Via running directly from command line with args: Starts the web-server directly on port 3300
 * Regardless of the option, this modules is always added as a plugin of t-motion-detector
 ******************************************************/

let md = require('t-motion-detector');
md.SetTraceLevel('error');
var log = md.Log;
let ent = require('./Entities');
let eventEmitter = require("events");
let fs = require("fs");
let readline = require('readline');
let mainEnv = {};
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//let express = require('express');
//let app = express();
/*let mongoose = require('mongoose');
let morgan = require('morgan');*/
let bodyParser = require('body-parser');
let port = 3300;
let _;

log.info("Starting t-motion-detector-cli web app...");

log.info("Registering new commands...");
try{
  md.Cli
    .option('-sw, --startweb', 'Starts the Web server')
    .option('-nc, --defaultConfig', "Ignore any config file (won't prompt to create a new one)")
    .option('-c, --config', "Use existing config file (WIP) - defaults to config/local")
    .parse(process.argv);
}catch(e){
  log.warn("Some error happened while parsing command, ignore if this module is imported, but if this is ran directly from command line via node t-motion-detector, then we could have a problem Houston...");
};

function ShouldStart(e,m,n,f,config){
  return true;
}

/**
 * Called when t-motion-detector is started. Called when StartWithConfig is called.
 * Adds default detector routes needed for the t-motion-detector-cli web-app
 * @return {boolean} True the plugin was successfully added.
 */
function Start(e,m,n,f,config){
  _.Start({
    //Config is missing!
    environment: e ? e : mainEnv
  });
  log.info("PLUGIN: Checking if any motion detector was passed via config to this environment...");
  if (m && m.length > 0){
    //Will add detectors only if passed as parameter
    log.info(`PLUGIN: Yes, found ${m.length} plugin(s)`);
    log.info(`  first is ${m[0].constructor.name}:${m[0].name}. Adding...`);
    _.AddDetector(m);    
  } else {
    log.info("PLUGIN: No. Adding default detectors and notifiers.");
    _.AddDetector(routeAddDetector);
    _.AddDetector(routeAddNotifier);
    _.AddDetector(routeRemoveNotifier);
    _.AddDetector(routeGetDetectors);
    _.AddDetector(routeGetNotifiers);
    _.AddDetector(routeDeactivateDetector);
    _.AddDetector(routeActivateDetector);
    _.AddDetector(routeGetEnvironment);
    //Assumes no constructor was added so forces listen
    _.GetEnvironment().listen();
  }

  if (n) _.AddNotifier(n);

  //TO DELETE
  let key = new _.Config().slackHook();
  let sn = new _.Extensions.SlackNotifier("My slack notifier", key);
  _.AddNotifier(sn);
  log.info(`Attempting to verify which port is being used from ${GetExpressEnvironment().constructor.name}...`); 
  port = GetExpressEnvironment().port ? GetExpressEnvironment().getPort() : port;
  console.log("##########################################");
  console.log(`##  STARTING WEB SERVER on port ${port}... ##`);
  console.log("##########################################");
}

//in case a MultiEnvironment exists, this module must be able to find the underlying ExpressEnvironment
function GetExpressEnvironment()
{
  let _env = _.GetEnvironment();
  //When checking for instances I'm using the constructor name since we've had wrong false instanceof;
  if(_env.constructor.name == "MultiEnvironment") {
    let _candidates = _env.getCurrentState();
    for(let c in _candidates)
    {
      if(_candidates[c].constructor.name == "ExpressEnvironment"){
        return _candidates[c]; 
      }
    }
  }else{
    //Assumes that the only environment is already an ExpressEnvironment
    return _env; 
  } 
}


/**
 * Called when t-motion-detector is reset. Called when Reset is called.
 * Emits also a "reset" event which can be used for performing additional tasks
 * @return {boolean} True the plugin was successfully added.
 */
function Reset(){
  log.info("Calling plugin Reset method...");
  //Do some reset stuff here
  this.emit("reset");
}

/**
 * Checks if there is an admin user saved in the system.
 * An admin is set in the .tmotion file with a special entry admin=XXXX
 * @return {string} the username .
 */
function AdminExists(){
  let lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('.tmotion')
  });

  lineReader.on('line', function (line) {
    throw new Error("READ MAN!!!");
  });
}

mainEnv = new ent.ExpressEnvironment(port, undefined, undefined, 200000, 10, false);

let app = mainEnv.getWebApp();
/*
//TODO: Create routes in future
let item = require('./app/routes/route1');
let config = require('config'); //we load the db location from the JSON files

//db options
let options = { 
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
}; 

//db connection      
mongoose.connect(config.DBHost, options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//don't show the log when it is test
if(config.util.getEnv('NODE_ENV') !== 'test') {
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}*/

//parse application/json and look for raw text
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));  


let routeAddDetector = new ent.RequestDetector("Add detector route", "/config/detectors/add", "AddDetector", "POST");
let routeAddNotifier = new ent.RequestDetector("Add notifier route", "/config/notifiers/add", "AddNotifier", "POST");
let routeRemoveNotifier = new ent.RequestDetector("Remove notifier route", "/config/notifiers/remove", "RemoveNotifier", "POST");

let routeGetDetectors = new ent.RequestDetector("Get Detectors route", "/config/detectors", "GetMotionDetectors");
let routeGetNotifiers = new ent.RequestDetector("Get Notifiers route", "/config/notifiers", "GetNotifiers");

let routeDeactivateDetector = new ent.RequestDetector("Deactivate Detectors route", "/config/detectors/deactivate", "DeactivateDetector;name", "POST");
let routeActivateDetector = new ent.RequestDetector("Activate Detectors route", "/config/detectors/activate", "ActivateDetector;name", "POST");

let routeGetEnvironment = new ent.RequestDetector("Get Environment route", "/config/environment", "GetEnvironment");

//Plugin exports
function PreAddPlugin()
{
}
function PostAddPlugin(plugin)
{
  _ = plugin._;
}
function PreRemovePlugin(plugin)
{
}
function PostRemovePlugin()
{
}

eventEmitter.call(this);

module.exports = app;
app.Log = log;
app.GetExpressEnvironment = GetExpressEnvironment;
app.Start = Start;
app.ShouldStart = ShouldStart;
app.Reset = Reset;
app.PreAddPlugin = PreAddPlugin;
app.PostAddPlugin = PostAddPlugin;
app.PreRemovePlugin = PreRemovePlugin;
app.PostRemovePlugin = PostRemovePlugin;
app.RL = rl;
app._ = _;

log.info("Adding this module as plugin...");
if(!md.AddPlugin(module)) throw new Error('There was an error adding this plug-in');
if (md.Cli.startweb) {
  log.info('  Starting web server;');
  if (md.Cli.defaultConfig) {
    //TODO: Add a way of including a custom config, which then should call StartWithConfig in the Plugin
    log.info('  No config declared, proceeding...;');
  } else {
    //TODO: Check if there is a config on ./, where the command is being run
    log.warn('  No config file seems to exist, to run without a config.js file run with --defaultConfig option;');;
  }
  /*if (!AdminExists()){
    log.error('ERROR no admin user seems to be created, please use "--admin SomeAdminUser" to add an admin user for the first use.');;    
  }*/
  Start();
}
else {
  if (require.main === module) {
    log.error('Module was called directly from the console without any arguments, this is not allowed.');
    log.error(' Please use "--help" to see list of commands, or use it as a dependency (via require statement) in your application instead.');
    process.exit(1);
  }
  else {
    //
    log.info('Module was added as library.');
  }
}
