#!/usr/bin/env node
"use strict"

/*******************************************************
 * VERMON-WEB Plugin
 * There are 2 ways to use this tool:
 * 1: Via "require" keyword: This Adds the module as a 
 *    library and allows between others, running a 
 *    server programatically with pre-configured elements
 *    via the StartWithConfig function;
 * 2: Via running directly from command line with args: 
 *    "> vermon --startweb"
 *    Starts the web-server directly on port 3300
 ******************************************************/

let vermon; //Vermon is no longer imported, but injected in real-time via the 'vermon.use' function
let core = require('vermon-core-entities')
let log = core.utils.setLevel('info')
let entities = require('./Entities')
let bodyParser = require('body-parser')

  //  ╔═╗╦═╗╦╦ ╦╔═╗╔╦╗╔═╗  ╔═╗╦═╗╔═╗╔═╗╔═╗╦═╗╔╦╗╦╔═╗╔═╗
  //  ╠═╝╠╦╝║╚╗║╠═╣ ║ ║╣   ╠═╝╠╦╝║ ║╠═╝║╣ ╠╦╝ ║ ║║╣ ╚═╗
  //  ╩  ╩╚═╩ ╚╝╩ ╩ ╩ ╚═╝  ╩  ╩╚═╚═╝╩  ╚═╝╩╚═ ╩ ╩╚═╝╚═╝
let port = process.env.VERMON_PORT || 3300
let mainEnv = {}
let webApp = {}

  //  ╔═╗╦ ╦╔╗ ╦  ╦╔═╗  ╔═╗╦ ╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ╠═╝║ ║╠╩╗║  ║║    ║╣ ║ ║║║║║   ║ ║║ ║║║║╚═╗
  //  ╩  ╚═╝╚═╝╩═╝╩╚═╝  ╩  ╚═╝╝╚╝╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
function reset() {
  log.info('Calling vermon-web plugin reset method...')
  //Do some reset stuff here
}

function start(e,m,n,f,config) {
  log.info('Calling vermon-web plugin start method, with parameters...')
  createMainEnvironment()
  setupEnvironment(e)
  setupWebServer()
  setupRoutes(m)
}

function getWebApp() {
  log.info('Running getWebApp...')
  if(!(webApp && webApp.request)) {
    setupWebServer()
  }
  return webApp
}

  //  ╔═╗╦═╗╦╦ ╦╔═╗╔╦╗╔═╗  ╔═╗╦ ╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ╠═╝╠╦╝║╚╗║╠═╣ ║ ║╣   ║╣ ║ ║║║║║   ║ ║║ ║║║║╚═╗
  //  ╩  ╩╚═╩ ╚╝╩ ╩ ╩ ╚═╝  ╩  ╚═╝╝╚╝╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
function setupRoutes(routes) {
  log.info('Setting up routes...')
  if (parametersExist(routes)) {
    addRoutes(routes)
  } else {
    fallbackRoutes()
    //If fallback routes are used this was called from CLI which by default
    //does not listen to requests, will start listening now...
    environmentListen()
  }
}

function parametersExist(parameters) {
  log.info("PLUGIN: Checking if any parameter was passed via config to this environment...");
  return parameters && parameters.length > 0;
}

function fallbackRoutes() {
  //Default routes
  let routeAddDetector =        new entities.RequestDetector("Add detector route", "/config/detectors/add", "AddDetector", "POST");
  let routeAddNotifier =        new entities.RequestDetector("Add notifier route", "/config/notifiers/add", "AddNotifier", "POST");
  let routeRemoveNotifier =     new entities.RequestDetector("Remove notifier route", "/config/notifiers/remove", "RemoveNotifier", "POST");
  let routeGetDetectors =       new entities.RequestDetector("Get Detectors route", "/config/detectors", "GetMotionDetectorsNonSingleton");
  let routeGetNotifiers =       new entities.RequestDetector("Get Notifiers route", "/config/notifiers", "GetNotifiers");
  let routeDeactivateDetector = new entities.RequestDetector("Deactivate Detectors route", "/config/detectors/deactivate", "DeactivateDetector;name", "POST");
  let routeActivateDetector =   new entities.RequestDetector("Activate Detectors route", "/config/detectors/activate", "ActivateDetector;name", "POST");
  let routeGetEnvironment =     new entities.RequestDetector("Get Environment route", "/config/environment", "GetEnvironment");
  log.info("PLUGIN: No. Adding default detectors and notifiers.");
  vermon.AddDetector(routeAddDetector);
  vermon.AddDetector(routeAddNotifier);
  vermon.AddDetector(routeRemoveNotifier);
  vermon.AddDetector(routeGetDetectors);
  vermon.AddDetector(routeGetNotifiers);
  vermon.AddDetector(routeDeactivateDetector);
  vermon.AddDetector(routeActivateDetector);
  vermon.AddDetector(routeGetEnvironment);
}

function addRoutes(detectors) {
  log.info(`PLUGIN: Yes, found ${detectors.length} detector(s)`);
  log.info(`  first is ${detectors[0].constructor.name}:${detectors[0].name}. Adding...`);
  vermon.AddDetector(detectors); 
}

function setupWebServer() {
  log.info('Setting up web-server...')
  try {
    port = getExpressEnvironment().port ? getExpressEnvironment().getPort() : port
  } catch(e) {
    log.error('Error getting environment, ignoring...')
    log.error(e)
  }
  console.log('╔═════════════════════════════════════════════╗')
  console.log(`║     Setting up WEB SERVER on port ${port}...   ║`)
  console.log('╚═════════════════════════════════════════════╝')  
}

function setupEnvironment(e) {
  log.info('Calling setupEnvironment method...')
  vermon.Start({
    environment: e ? e : mainEnv
  });
}

function environmentListen() {
  log.info('Calling environmentListen method...')
  getExpressEnvironment().listen();
}

function initCLI() {
  log.info('Initializing CLI commands...')
  vermon.Cli
    .option('-w, --startweb', 'Starts the Web server', start)
    .option("-l, --log <level>", "Which log level to use (error | warn | info | debug | trace)")
    .action(function(options){
      if(options.log) {
        console.log('CLI using %s log level', options.log)
        log = vermon.SetTraceLevel(options.log)        
      }
    })
    .parse(process.argv)

  if(vermon.Cli.startweb) {
    //Do nothing
  } else {
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
}

function createMainEnvironment(listen = false) {
  log.info('Creating express environment...')
  mainEnv = new entities.ExpressEnvironment(port, undefined, undefined, 200000, 10, listen)
  webApp = mainEnv.getWebApp()
}

//in case a MultiEnvironment exists, this module must be able to find the underlying ExpressEnvironment
function getExpressEnvironment()
{
  let _env = vermon.GetEnvironment()
  //When checking for instances I'm using the constructor name since we've had wrong false instanceof;
  if(_env.constructor.name == 'MultiEnvironment') {
    let _candidates = _env.getCurrentState()
    for(let c in _candidates)
    {
      if(_candidates[c].constructor.name == 'ExpressEnvironment'){
        return _candidates[c] 
      }
    }
  }else{
    //Assumes that the only environment is already an ExpressEnvironment
    return _env 
  } 
}


  //  ╔═╗╦  ╦ ╦╔═╗╦╔╗╔   ╔═╗╦ ╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ╠═╝║  ║ ║║ ╦║║║║   ║╣ ║ ║║║║║   ║ ║║ ║║║║╚═╗
  //  ╩  ╚═╝╚═╝╚═╝╩╝╚╝   ╩  ╚═╝╝╚╝╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
function PreAddPlugin(parent) {
  log.info(`Vermon-web Plugin: will inject new functions into parent...`);
  parent.GetMotionDetectorsNonSingleton = () => {
    return getExpressEnvironment().motionDetectors;
  }
  //Substitutes by the actual parent library;
  vermon = parent
  exports._ = parent
  //inject the parent library (e.g. vermon) in entities as well
  entities.inject(parent)
};
function PostAddPlugin() {
  initCLI()
}
function ShouldStart() { return true }

  //Exports
exports.getWebApp = getWebApp
exports.reset = reset
exports.start = start
exports.PreAddPlugin = PreAddPlugin
exports.PostAddPlugin = PostAddPlugin
exports.Start = start //Plugin calls "Start" with uppercase (S)
exports.ShouldStart = ShouldStart


  //  ╔═╗╦ ╦╔╗ ╦  ╦╔═╗  ╔═╗╦═╗╔═╗╔═╗╔═╗╦═╗╔╦╗╦╔═╗╔═╗
  //  ╠═╝║ ║╠╩╗║  ║║    ╠═╝╠╦╝║ ║╠═╝║╣ ╠╦╝ ║ ║║╣ ╚═╗
  //  ╩  ╚═╝╚═╝╩═╝╩╚═╝  ╩  ╩╚═╚═╝╩  ╚═╝╩╚═ ╩ ╩╚═╝╚═╝
exports.id = "VERMON_WEB"
// this => vermon (parent) => entities._ = this
