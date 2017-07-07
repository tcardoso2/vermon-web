# t-motion-detector-cli
A cli tool (dashboard) to monitor your Environment, Motion sensors and Notifiers.
It has been repurposed from the original intent because I didn't see the need to
create an explicit cli tool either then what the t-motion-detector tool will
provide, via the npm run-script command.

* v 0.1.5: Implemented first service config/detectors, not yet in a readable friendly format (WIP).
* v 0.1.4: Refactoring the ExpressNotifier as an ExpressEnvironment instead, because it fits more the model of an Environment, where Motion Detectors and Notifiers can be put on top instead (WIP).
Added static directory, and added AngularJS, first test page;
* v 0.1.3: Created first version of the ExpressNotifier a wrapper of for the Express web server as a notifier object
* v 0.1.2: Removed user story unit tests  (not relevant for this project).
* v 0.1.1: Building first unit tests, first express welcome message;
* v 0.1.0: First version, draft for first tests and package file;