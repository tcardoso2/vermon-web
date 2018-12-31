#!/usr/bin/env node
"use strict"

/*******************************************************
 * VERMON-WEB
 * There are 2 ways to use this tool:
 * 1: Via "require" keyword: This Adds the module as a 
 *    library and allows between others, running a 
 *    server programatically with pre-configured elements
 *    via the StartWithConfig function;
 * 2: Via running directly from command line with args: 
 *    "> vermon --startweb"
 *    Starts the web-server directly on port 3300
 ******************************************************/

let vermon = require('vermon')
let log = vermon.SetTraceLevel('debug')
let entities = require('./Entities')


  //  ╔═╗     ╔═╗         ╔═╗
  //  ╠═╝     ║╣          ╚═╗
  //  ╩  rivat╚═╝Propertie╚═╝
let port = process.env.VERMON_PORT || 3300
let mainEnv = {}
let webApp = {}

//Public functions
function reset() {
  log.info('Calling vermon-web plugin reset method...')
  //Do some reset stuff here
}

function start(e,m,n,f,config) {
  log.info('Calling vermon-web plugin start method...')
  setupWebServer()
  setupEnvironment(e)
  environmentListen()
}

function getWebApp() {
  if(!webApp) {
    setupWebServer()
  }
  return webApp
}

//Private functions
function setupWebServer() {
  log.info('Setting up web-server...')
  try {
    port = getExpressEnvironment().port ? getExpressEnvironment().getPort() : port
  } catch(e) {
    log.error('Error getting environment, ignoring...')
    log.error(e)
  }
  console.log('###############################################')
  console.log(`##  Setting up WEB SERVER on port ${port}... ##`)
  console.log('###############################################')  
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
    .option('-sw, --startweb', 'Starts the Web server', start)
    .parse(process.argv)
}

function setupWebServer() {
  mainEnv = new entities.ExpressEnvironment(port, undefined, undefined, 200000, 10, false)
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

initCLI()
setupWebServer()

exports.getWebApp = getWebApp
exports.reset = reset
exports.start = start
