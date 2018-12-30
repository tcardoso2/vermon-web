#!/usr/bin/env node


/*******************************************************
 * VERMON-WEB
 * There are 2 ways to use this tool:
 * 1: Via "require" keyword: This Adds the module as a 
 *    library and allows between others, running a 
 *    server programatically with pre-configured elements
 *    via the StartWithConfig function;
 * 2: Via running directly from command line with args: 
 *    Starts the web-server directly on port 3300
 *    Regardless of the option, this modules is always 
 *    added as a plugin of t-motion-detector
 ******************************************************/

let vermon = require('vermon')
let log = vermon.SetTraceLevel('debug')

function reset() {
  log.info('Calling vermon-web plugin reset method...')
  //Do some reset stuff here
}

//Private properties
let port = process.env.VERMON_PORT || 3300

//Private functions
function startWebServer() {
  log.info('Starting web-server...')
  try {
    port = getExpressEnvironment().port ? getExpressEnvironment().getPort() : port
  } catch(e) {
    log.error('Error getting environment, ignoring...')
    log.error(e)
  }
  console.log('##########################################')
  console.log(`##  STARTING WEB SERVER on port ${port}... ##`)
  console.log('##########################################')  
}

function initCLI() {
  log.info('Initializing CLI commands...')
  vermon.Cli
    .option('-sw, --startweb', 'Starts the Web server', startWebServer)
    .parse(process.argv)
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

exports.reset = reset