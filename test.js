let main = require("./main");
let log = main.Log;

console.log(log);

let config = new main._.Config("test/config_express_test6.js", true, false); //force=false
//WARNING: force = true does not work if filters are added into the environment.

main._.StartWithConfig(config,  (e,d,n,f) => {
  //Starts the web-server;
  console.log("Environment is on:", e.constructor.name);
  console.log(`Nr. of detectors ${d.length}`);
  console.log(`Nr. of notifiers ${n.length}`);  
  console.log("OK!!");
});
