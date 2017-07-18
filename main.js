let md = require('t-motion-detector');
let log = md.Log;
let ent = require('./Entities');

//let express = require('express');
//let app = express();
/*let mongoose = require('mongoose');
let morgan = require('morgan');*/
let bodyParser = require('body-parser');
let port = 3300;

md.Reset();
log.info("Starting t-motion-detector-cli web app...");

function Start(){
  md.Start({
    environment: mainEnv
  });
}

mainEnv = new ent.ExpressEnvironment(port);
Start();

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

//app.get("/", (req, res) => res.json({message: "Welcome!"}));

//Serve content from public folder as static
//app.use(express.static('public'))

/*app.route("/route1")
    .get(item.getItems)
    .post(item.postItem);
app.route("/route1/:id")
    .get(item.getItem)
    .delete(item.deleteItem)
    .put(item.updateItem);
*/
//app.listen(port);

let routeDConfig = new ent.RequestDetector("My route for detectors", "/config/detectors", "GetMotionDetectors");
routeDConfig.name = "Config Route for Detectors";
md.AddDetector(routeDConfig);

let routeNConfig = new ent.RequestDetector("My route for notifiers", "/config/notifiers", "GetNotifiers");
routeNConfig.name = "Config Route for Notifiers";
md.AddDetector(routeNConfig);

log.info(`Listening on port ${port}`);
console.log(`Started on port ${port}`);

//TO DELETE
let key = new md.Config().slackHook();
let n = new md.Extensions.SlackNotifier("My slack notifier", key);
md.AddNotifier(n);

module.exports = app; // for testing
app.md = md;
app.Log = log;
app.Start = Start;