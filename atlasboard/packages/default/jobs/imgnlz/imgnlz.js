/**
 * Job: imgnlz
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
    dependencies.mime = require('file-type');
    dependencies.moment = require('moment');
    dependencies.requests = {};
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
    const fs = require('fs');

    /*

     2. CONFIGURATION CHECK

     You probably want to check that the right configuration has been passed to the job.
     It is a good idea to cover this with unit tests as well (see test/imgnlz file)

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
     Have a look at test/imgnlz for an example of how to unit tests this easily by mocking easyRequest calls

     */
    //Subtract one minute because can be ahead of time and the resource might not exist yet
    let dt = dependencies.moment().local().subtract(2, 'minutes');
    if(dt.format('mm') % 5){
      logger.info(`Not the time to request (${dt}), local time is ${dependencies.moment().local()}...`);
      jobCallback(null, {title: config.widgetTitle, filePreffix: config.filePreffix, fileSuffix: config.fileSuffix});
      return;
    }
    let url = `${config.baseURL}${config.filePreffix}${dt.format('YYYYMMDDHHmm')}${config.fileSuffix}`;
    //"http://www.weather.gov.sg/files/rainarea/50km/v2/dpsri_70km_2018091410100000dBR.dpsri.png";
    //;
    
    logger.log(dependencies.requests);
    if (dependencies.requests[url]){ 
      logger.warn(`Already requested for ${url}, ignoring...`);
      jobCallback(null, {title: config.widgetTitle, filePreffix: config.filePreffix, fileSuffix: config.fileSuffix});
      return;
    }
    logger.info(`Requesting URL: ${url}`);

    let fp = 'assets/images/latest.png';
    let file = fs.createWriteStream(fp);
    
    // request the file from a remote server
    let rem = dependencies.request(url);
    let okType = false;

    rem.on('data', function(chunk) {
      let t = dependencies.mime(fp);
      logger.info(`Got chunk, checking file type... ${JSON.stringify(t)}`);
      
      if (t && t.ext == "png" && mime == "image/png"){
        okType = true;
        file.write(chunk);
        logger.info("ok type :)");
      } else {
        okType = false;
        logger.error("file type not ok :(, will be ovewriten next time...");
      }
      // instead of loading the file into memory
      // after the download, we can just pipe
      // the data as it's being downloaded
    });
    rem.on('end', function() {
      dependencies.requests[url] = okType;
      logger.info('Finished saving to file');
      //dependencies.requests[url] = true;
      jobCallback(null, {title: config.widgetTitle, filePreffix: config.filePreffix, fileSuffix: config.fileSuffix});
    });
  }
};