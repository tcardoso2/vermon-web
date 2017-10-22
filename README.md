[![NPM info](https://nodei.co/npm/t-motion-detector-cli.png?downloads=true)](https://www.npmjs.com/package/t-motion-detector-cli)

[![Travis build status](https://travis-ci.org/tcardoso2/t-motion-detector-cli.png?branch=master)](https://travis-ci.org/tcardoso2/t-motion-detector-cli)
[![dependencies](https://david-dm.org/tcardoso2/t-motion-detector-cli.svg)](https://david-dm.org/tcardoso2/t-motion-detector-cli.svg)

[![Unit tests](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/badge.svg)](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/badge.svg) 

# t-motion-detector-cli
A t-motion-detector Plugin CLI/API tool (dashboard) to monitor your Environment, Motion sensors and Notifiers.
It has been repurposed from the original intent because I didn't see the need to
create an explicit cli tool either than what the t-motion-detector tool will
provide, via the npm run-script command. Provides also an Express web-application which a basic API (REST services) to view and manage the environment  

* v 0.3.5 :Implemented CommandStdoutDetector. Added mocha unit tests badge.  
* v 0.3.4 :Working on CommandStdoutDetector (WIP), small fixes. Minor improvements on documentation.  
* v 0.3.3 :Added handling to not allow starting main.js directly, only via 'require' keyword; Added reporter badge for unit tests. Started creating tests for CommandStdoutDetector.  
* v 0.3.2 :Updated dependency reference to t-motion-detector@v0.5.13.  
* v 0.3.1 :Implementing Reset method for Plugins. Implementing default Detectors created when t-motion-detector-cli is ran directly (e.g. there should be default detectors to create and remove elements and a default ExpressEnvironment) - WIP. Normalizing logging to use log library instead of console.log for proper logging. Update to version t-motion-detector@v0.5.10  
* v 0.3.0 :Updated dependency reference to t-motion-detector@v0.5.9, fixes. Working on maxAttampts for the Environment when address is already in use. Added more tests to run directly application from main, and be able to add elements from the web-UI (WIP). Working on proper HTML CSS formating. "Start" function of the main module
is now called after StartWithConfig   
* v 0.2.13:Updated dependency reference to t-motion-detector@v0.5.6  
* v 0.2.12:Tested SystemEnvironment json service  
* v 0.2.11:Added new tests, working on SystemEnvironment json service, updated license and reference to t-motion-detector@v0.5.3  
* v 0.2.10:updating to t-motion-detector@0v.0.5.1  
* v 0.2.9: Changed inheritance of ExpressEnvironment to SystemEnvironment, fixed tests (WIP)  
* v 0.2.8: updating to t-motion-detector@0v.0.5.0, adding badges for npm, travis build and dependency status.   
* v 0.2.7: updating to t-motion-detector@0v.0.4.14 to remove postinstall script  
* v 0.2.6: adding travis-ci config files, updating to t-motion-detector@0v.4.13  
* v 0.2.5: Adding new unit tests for a new detector, NetworkDetector.  
* v 0.2.4: Binding to t-motion-detector version 0.4.11, to allow avoiding type checks when adding Detector instances.  
* v 0.2.3: Binding to t-motion-detector version 0.4.10  
* v 0.2.2: Added static address in the ExpressEnvironment constructor, defaulting to internal public folder  
* v 0.2.1: Testing Support to Extension integration with t-motion-detector v 0.4.9 (WIP)  
* v 0.2.0: First version published to npm. Added Code of Conduct and template for Documentation (WIP)  
* v 0.1.9: Concluded implementation of POST method to activate and deactivate Detectors.  
* v 0.1.8: WIP, Started testing POST methods, adding activation and deactivation of Motion Detectors.  
* v 0.1.7: Configuration allows to map routes to functions in main file in t-motion-detector, WIP on HTML  
* v 0.1.6: Fixed some bugs create dinamic page for detectors and notifiers, binded to temporary slack notifier.  
* v 0.1.5: Implemented first service config/detectors, not yet in a readable friendly format (WIP).  
* v 0.1.4: Refactoring the ExpressNotifier as an ExpressEnvironment instead, because it fits more the model of an Environment, where Motion Detectors and Notifiers can be put on top instead (WIP).  
Added static directory, and added AngularJS, first test page;  
* v 0.1.3: Created first version of the ExpressNotifier a wrapper of for the Express web server as a notifier object.  
* v 0.1.2: Removed user story unit tests  (not relevant for this project).  
* v 0.1.1: Building first unit tests, first express welcome message;  
* v 0.1.0: First version, draft for first tests and package file;  

## Links  
  - [Documentation](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/DOCUMENTATION.md) 
  - [Code of Conduct](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/CODE_OF_CONDUCT.md)   
  - [Adding Plugins](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/ADDING_PLUGINS.md)   
