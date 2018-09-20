/*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var md = require('t-motion-detector');
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let ent = require('../Entities.js');
let main = require('../main.js');
let chaiHttp = require('chai-http');
let motion = main._;

//Chai will use promises for async events
chai.use(chaiAsPromised);
//Chai will use promises for async events
chai.use(chaiHttp);

function helperReset(){
  motion.Reset();
  delete require.cache[require.resolve('../main')];
  main = require('../main');
  motion = main._;
}
before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  main.Reset();
  done();
});

describe("When an API environment is created, ", function() {
  it('Should inherit the Environment class', function () {
    let e = new ent.APIEnvironment();
    (e instanceof motion.Entities.Environment).should.equal(true);
  });

  it("should be able to set an endpoint API which the broker should call", function (done) {
    let e = new ent.APIEnvironment();
    e.setEndPoint("http://someendpoint");
    e._endpoint.should.equal("http://someendpoint");
    done();
  });

  it("should be able to set an API key and an API secret", function (done) {
    let e = new ent.APIEnvironment();
    e.setAPIKey("MY_KEY");
    e.setAPISecret("MY_SECRET")
    e._key.should.equal("MY_KEY");
    e._secret.should.equal("MY_SECRET");
    done();
  });

  it("should be able to be set to mock mode", function (done) {
    let e = new ent.APIEnvironment();
    e.setMockMode(true);
    e._isMockMode.should.equal(true);
    done();
  });

  xit('Should be able to get the key and secret from a local configuration file', function () {
    helperReset();
    let _config = new main._.Config("/test/config_api_test.js");
    main._.StartWithConfig(_config, (e,d,n,f) =>{
      (e instanceof ent.APIEnvironment).should.equal(true);
      e._key.should.equal("key1");
      e._secret.should.equal("secret1");
      e._endpoint.should.equal("endpoint1");
      e._isMockMode.should.equal(true);
    });
  });

  xit("TODO: should be able to construct a proper endpoint based on key/secret/endpoint data", function (done) {
    let e = new ent.APIEnvironment();
    should.fail();
  });
  xit("TODO: should be able to make a request to the endpoint and get somee response", function (done) {
    let e = new ent.APIEnvironment();
    should.fail();
  });

  xit("TODO: should be able to have a method to transform the response from endpoint", function (done) {
    let e = new ent.APIEnvironment();
    should.fail();
  });

  xit("TODO: should be able to get data and transform it and send it through a callback function", function (done) {
    let e = new ent.APIEnvironment();
    should.fail();
  });

  xit("TODO: should be able to have a means for mocking a response, if in mock mode", function (done) {
    let e = new ent.APIEnvironment();
    should.fail();
  });
});
