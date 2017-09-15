# t-motion-detector-cli
A cli/API tool (dashboard) to monitor your Environment, Motion sensors and Notifiers.
It has been repurposed from the original intent because I didn't see the need to
create an explicit cli tool either than what the t-motion-detector tool will
provide, via the npm run-script command.
* Provides an Express web-application which a basic API (REST services) to view and manage the environment

* v 0.2.7: updating to t-motion-detector@0v.4.14 to remove postinstall script  
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
