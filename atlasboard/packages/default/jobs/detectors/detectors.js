/**
 * Job: detectors
 *
 * Expected configuration:
 *
 * ## PLEASE ADD AN EXAMPLE CONFIGURATION FOR YOUR JOB HERE
 * { 
 *   myconfigKey : [ 
 *     { serverUrl : 'localhost' } 
 *   ]
 * }
 */
let cmd = require("node-cmd");

let batcaveTempSensorId = "sensor_ht_158d00020db386";
let salaTempSensorId = "sensor_ht_158d000208fc30";
let bedroomTempSensorId = "sensor_ht_158d0001f54051";

var returnData = {};

module.exports = {

  /**
   * Executed on job initialisation (only once)
   * @param config
   * @param dependencies
   */
  onInit: function (config, dependencies) {

    /*
    This is a good place for initialisation logic, like registering routes in express:

    dependencies.logger.info('adding routes...');
    dependencies.app.route("/jobs/mycustomroute")
        .get(function (req, res) {
          res.end('So something useful here');
        });
    */
  },

  /**
   * Executed every interval
   * @param config
   * @param dependencies
   * @param jobCallback
   */
  onRun: function (config, dependencies, jobCallback) {

    /*
     1. USE OF JOB DEPENDENCIES

     You can use a few handy dependencies in your job:

     - dependencies.easyRequest : a wrapper on top of the "request" module
     - dependencies.request : the popular http request module itself
     - dependencies.logger : atlasboard logger interface

     Check them all out: https://bitbucket.org/atlassian/atlasboard/raw/master/lib/job-dependencies/?at=master

     */

    var logger = dependencies.logger;

    /*

     2. CONFIGURATION CHECK

     You probably want to check that the right configuration has been passed to the job.
     It is a good idea to cover this with unit tests as well (see test/detectors file)

     Checking for the right configuration could be something like this:

     if (!config.myrequiredConfig) {
     return jobCallback('missing configuration properties!');
     }


     3. SENDING DATA BACK TO THE WIDGET

     You can send data back to the widget anytime (ex: if you are hooked into a real-time data stream and
     don't want to depend on the jobCallback triggered by the scheduler to push data to widgets)

     jobWorker.pushUpdate({data: { title: config.widgetTitle, html: 'loading...' }}); // on Atlasboard > 1.0


     4. USE OF JOB_CALLBACK

     Using nodejs callback standard conventions, you should return an error or null (if success)
     as the first parameter, and the widget's data as the second parameter.

     This is an example of how to make an HTTP call to google using the easyRequest dependency,
     and send the result to the registered widgets.
     Have a look at test/detectors for an example of how to unit tests this easily by mocking easyRequest call
     */
    if(config.useSocket){
      console.log("Will not fetch data from server but use sockets instead.");
    } else {
      populateData("sala_data", salaTempSensorId);
      populateData("bedroom_data", bedroomTempSensorId);
      populateData("batcave_data", batcaveTempSensorId);  
    }
    //First time will return empty, but i prefer this over making 3 sinchronous calls and only then returning the result
    jobCallback(false, {title: config.widgetTitle, data: returnData, useSocket: config.useSocket, divisions: config.divisions, sensors: config.sensors});
    /*
    dependencies.easyRequest.HTML('http://google.com', function (err, html) {
      // logger.trace(html);
      jobCallback(err, {title: config.widgetTitle, html: html});
    });*/
  }
};

function populateData(key, sensorId){
	console.log(`fetching ${key} data...`);
	cmd.get(
    `iobroker state get mihome.0.devices.${sensorId}.temperature`,
    function(err, data, stderr){
      if (!err && data.indexOf("Error") == -1){
        console.log('the sensor data is : ',data);
        returnData[key] = JSON.parse(data);
      }
      else {
        console.error(err);
      }
    });
}