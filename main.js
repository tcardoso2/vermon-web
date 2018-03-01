#!/usr/bin/env node

let md = require('t-motion-detector');
var log = md.Log;
let ent = require('./Entities');
let eventEmitter = require("events");
let fs = require("fs");
let readline = require('readline');
 
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
md.Cli
  .option('-sw, --startweb', 'Starts the Web server')
  .option('-nc, --defaultConfig', "Ignore any config file (won't prompt to create a new one)")
  .parse(process.argv);

/**
 * Called when t-motion-detector is started. Called when StartWithConfig is called.
 * Adds default detector routes needed for the t-motion-detector-cli web-app
 * @return {boolean} True the plugin was successfully added.
 */
function Start(e,m,n,f,config){
  log.info("Running 'Start' function of Plugin. Config exists? `${config}`");
  _.Start({
    //Config is missing!
    environment: e ? e : mainEnv
  });
  if (m){
    //Will add detectors only if passed as parameter
    _.AddDetector(m);    
  } else {
    _.AddDetector(routeAddDetector);
    _.AddDetector(routeAddNotifier);
    _.AddDetector(routeRemoveNotifier);
    _.AddDetector(routeGetDetectors);
    _.AddDetector(routeGetNotifiers);
    _.AddDetector(routeDeactivateDetector);
    _.AddDetector(routeActivateDetector);
    _.AddDetector(routeGetEnvironment);
  }

  if (n) _.AddNotifier(n);

  log.info(`Listening on port ${port}`);
  //TO DELETE
  let key = new _.Config().slackHook();
  let sn = new _.Extensions.SlackNotifier("My slack notifier", key);
  _.AddNotifier(sn);
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
app.Start = Start;
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
    log.error('  No config file seems to exist, to run without a config.js file run with --defaultConfig option;');;
  }
  /*if (!AdminExists()){
    log.error('ERROR no admin user seems to be created, please use "--admin SomeAdminUser" to add an admin user for the first use.');;    
  }*/
  mainEnv.listen();
}
else {
  if (require.main === module) {
    //Module was called directly instead of using commands
    log.error('Module called directly, please use "--help" to see list of commands, or use it as a dependency (via require statement) in your application.');
    process.exit(1);
  }
  else {
    log.error('No command was issued see --help for details');
  }
}