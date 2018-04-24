let main = require("./main");

let config = new main._.Config("test/config_express_test7.js"); //force=true
//WARNING: force = true does not work if filters are added into the environment.

main._.StartWithConfig(config,  (e,d,n,f) => {
  //Starts the web-server;
  console.log("Environment is on:", e.constructor.name);
  //e.getCurrentState()["Express Environment"].listen();
  console.log("OK!!");
});
