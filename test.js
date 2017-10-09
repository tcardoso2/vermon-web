let main = require("./main");

let config = new main._.Config("test/config_express_test6.js");

main._.StartWithConfig(config,  (e,d,n,f) => {
  console.log("OK!!");

});