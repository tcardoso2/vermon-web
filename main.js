let md = require('t-motion-detector');
let log = md.Log;
let ent = require('./Entities');

//let express = require('express');
//let app = express();
/*let mongoose = require('mongoose');
let morgan = require('morgan');*/
let bodyParser = require('body-parser');
let port = 3300;
let _;

log.info("Starting t-motion-detector-cli web app...");

//Used for tests
function Start(){
  _.Start({
    environment: mainEnv
  });
  _.AddDetector(routeDConfig);
  _.AddDetector(routeNConfig);
  _.AddDetector(routeDeactivateD);
  _.AddDetector(routeActivateD);

  log.info(`Listening on port ${port}`);
  console.log(`Started on port ${port}`);
  //TO DELETE
  let key = new _.Config().slackHook();
  let n = new _.Extensions.SlackNotifier("My slack notifier", key);
  _.AddNotifier(n);

}

mainEnv = new ent.ExpressEnvironment(port);

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

let routeDConfig = new ent.RequestDetector("My route for detectors", "/config/detectors", "GetMotionDetectors");
routeDConfig.name = "Config Route for Detectors";

let routeNConfig = new ent.RequestDetector("My route for notifiers", "/config/notifiers", "GetNotifiers");
routeNConfig.name = "Config Route for Notifiers";

let routeDeactivateD = new ent.RequestDetector("Deactivate Detectors", "/config/detector/deactivate", "DeactivateDetector;name", "POST");

let routeActivateD = new ent.RequestDetector("Activate Detectors", "/config/detector/activate", "ActivateDetector;name", "POST");

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

module.exports = app;
app.Log = log;
app.Start = Start;
app.PreAddPlugin = PreAddPlugin;
app.PostAddPlugin = PostAddPlugin;
app.PreRemovePlugin = PreRemovePlugin;
app.PostRemovePlugin = PostRemovePlugin;
app._ = _;

if(!md.AddPlugin(module)) throw new Error('There was an error adding this plug-in');