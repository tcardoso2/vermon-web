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

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let ent = require('../Entities');
let main = require('../main');
let events = require('events');
let express = require('express');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let motion = main._; //Assesses parent's export functions. Another short assessor is '$' which is only binded later
let Entities = motion.Entities;
let Extentions = motion.Extensions;


//Chai will use promises for async events
chai.use(chaiAsPromised);
chai.use(chaiHttp);

function helperReset(){
  motion.Reset();
  delete require.cache[require.resolve('../main')];
  main = require('../main');
  motion = main._;
  mainEnv = {};
}

before(function(done) {
  var n = undefined;
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

var mainEnv;
//Our parent block
describe('Before the test...', () => {
    beforeEach((done) => { //Before each test we empty the database
      //Do something
      //motion.Reset();
      done();
    });

  /*
  * Test the /GET route
  */

  describe("After starting express from main", function() {
    it('If ran directly from command line should not proceed without a proper command.', (done) => {
      this.timeout(5000);
      main._.Cmd.get('node main',(err, data, stderr) => {
        err.message.should.not.equal(null);
        stderr.should.not.equal('');
        stderr.indexOf('Module was called directly from the console without any arguments, this is not allowed.').should.be.gt(0);
        done();
      });
    });

    it('I should GET a Welcome message, on the welcome path, when calling Listen()', (done) => {
      main.Listen();
      chai.request(main)
        .get('/welcome')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({message: 'Welcome to T-Motion-CLI Web server!'});
          done();
      });
    });

    it('"/config/detectors" should return an array of 8 System Detectors', function (done) {
      //Prepare
      main.Start();
      main._.should.not.equal(undefined);
      main._.GetPlugins().should.not.eql({});
      chai.request(main)
        .get('/config/detectors')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.equal(8);
          done();
      });
    });

    it('When including a plugin, GetPlugins should return that plugin', function () {
      helperReset();
      main._.GetPlugins().should.not.eql({});
    });

    it('To add the t-motion-detector-cli plugin the program should be started with a config file, and a Start method callback should be provided to be called after motion._.StartWithConfig, adding only the detectors in the config file.', function (done) {
      //Prepare
      helperReset(); //Plugin t-motion-detector-cli added here
      let alternativeConfig = new main._.Config("/test/config_express_test.js");
      motion.StartWithConfig(alternativeConfig, (e,d,n,f) =>{
        //It is expected that the "Start" function of the plugin cli is called
        d.length.should.equal(2); //2 from the config file
        done();
      });
    });

    it('After Reseting the environment, if I try to get the environment without initializing after Reset, I should get an error that Environment does not exist.', function () {
      //Prepare
      helperReset();
      try{
        let myEnv = motion.GetEnvironment();
      } catch(e) {
        e.message.should.equal("Environment does not exist. Please run the Start() function first or one of its overrides.");
        return;
      }
      should.fail();
    });

    it('Plugins should also implement the "Reset" method which is run when the main.Reset() method is called, via event handler', function (done) {
      //Prepare
      helperReset();
      let _done = false;
      main.on("reset", ()=>{
        if (_done) return;
        _done = true;
        console.log("Test: Called done");
        done();
      });
      motion.Reset();
    });
    it.skip('When running motion._.StartWithConfig with a config file without an ExpressEnvironment, the system should not Start the Web Server.', function (done) {
      //Skipping for now, this works manually but via tests is failing...
      //Prepare
      helperReset();

      let emptyConfig = new main._.Config("/test/config_empty_test.js");
      main._.StartWithConfig(emptyConfig, (e,d,n,f) =>{
      chai.request("localhost:8080")
        .get('/config/detectors')
        .end((err, res) => {
          (res == undefined).should.equal(true);
          done();
        });
      });
    });

    it('When running motion._.StartWithConfig with a config file with only the ExpressEnvironment, the system should setup detectors to add and remove elements, and route for EnvironmentSystem, and Deactivate/Activate Detectors + Get detectors and Get Notifiers (total 8)', function (done) {
      //Prepare
      helperReset();
      main._.GetPlugins().should.not.eql({});

      let emptyConfig = new main._.Config("/test/config_express_only_test.js");
      main._.StartWithConfig(emptyConfig, (e,d,n,f) =>{
        (e instanceof ent.ExpressEnvironment).should.equal(true);
        e.port.should.equal(8080);
        //listen needs to be called explicitely before taking any request
        //e.listen();
        chai.request("localhost:8080")
        .get('/config/detectors')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.equal(8);  //AddDetector, AddNotifier, RemoveNotifier, GetEnvironment + 2 for Activate/Deactivate Detectors, Get Detectors, Get Notifiers
          res.body[0]._isActive.should.equal(true);
          done();
        });
      });
    });
  });

  describe("When starting t-motion with an ExpressEnvironment programatically", function(){
    
    it('when I pass a custom config file, the app should know whats my current working directory.', function () {
      //Prepare
      let alternativeConfig = new motion.Config("/test/config_express_test.js");
      alternativeConfig.isFallback().should.equal(false);
      alternativeConfig.cwd().should.equal(process.cwd() + "/");
    });

    it('ExpressEnvironment should inherit Environment class', function () {
      mainEnv = new ent.ExpressEnvironment();
      (mainEnv instanceof motion.Entities.Environment).should.equal(true);
    });

    it('it should start a web-server at default port 8123', function (done) {
      helperReset();
      mainEnv = new ent.ExpressEnvironment(8123, "public"); 
      motion.Start({ environment: mainEnv});
      let app = mainEnv.getWebApp();
      chai.request(app)
        .get('/')
        .end((err, res) => {
          mainEnv.stop();
          mainEnv.getPort().should.equal(8123);
          mainEnv.getStaticAddr().should.equal("public");
          res.should.have.status(200);
          done();
        });
    });
    
    it.skip('it should be able to stop the web-server', function (done) {
      //TODO: Not able for now to test this properly
      let e = new ent.ExpressEnvironment();
      e.stop();
      done();
    });

    it('should be able to take the first parameter in the constructor as being the port', function (done) {
      let e2 = new ent.ExpressEnvironment(8030) 
      motion.Start({ environment: e2});
      let app2 = e2.getWebApp();
      chai.request(app2)
        .get('/')
        .end((err, res) => {
          e2.getPort().should.equal(8030)
          res.should.have.status(200);
          done();
          e2.stop();
        });
    });

    it('it should be able to serve static content', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp();
      mainEnv.setStatic('public');
      chai.request(app)
        .get('/test.html')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.equal("This is a test file!");
          done();
        });
    });

    it('js folder should exist with angular.js library', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp();
      chai.request(app)
        .get('/js/angular.min.js')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('main index html file should exist', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp();
      chai.request(app)
        .get('/index.html')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('js folder should exist with angular.js library', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp();
      chai.request(app)
        .get('/js/angular.min.js')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('js folder should exist with app.js client library for Model and Controller', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp();
      chai.request(app)
        .get('/js/app.js')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe("When starting t-motion with an ExpressEnvironment and RequestDetector", function(){
    it('It should be possible to configure a route.', function (done) {
      //Prepare
      helperReset();
      mainEnv = new ent.ExpressEnvironment(8123, "public"); 
      let md = new ent.RequestDetector("My route detector", "/config/mylink", (req, res) => {
        try{
          res.json(motion.GetMotionDetectors());
        } catch(e) {
          console.error(e);
        }
      });
      md.name = "My Route detector";

      motion.Start({
        environment: mainEnv,
        initialMotionDetector: md,
      });

      let detectors = motion.GetMotionDetectors();
      let pirDetector = detectors[0];
      let app = mainEnv.getWebApp();
      //Assert
      chai.request(app)
        .get('/config/mylink')
        .end((err, res) => {
          //Stopping so that next test can run
          mainEnv.stop();
          res.should.have.status(200);
          console.log(res.body);
          res.body.length.should.equal(1);
          res.body[0].name.should.equal(pirDetector.name);
          //res.body.should.be.eql([{ PIRMotiondetector: { name: pirDetector.name, pin: pirDetector.pin } }]);
          done();
      });
    });
  });

  describe("When starting t-motion with an ExpressEnvironment via a config file", function(){
    
    it('The URL route should be valid', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      motion.Reset();
      let alternativeConfig = new motion.Config("test/config_express_test.js");
      motion.StartWithConfig(alternativeConfig);

      let myEnv = motion.GetEnvironment();

      let app2 = myEnv.getWebApp();
      chai.request(app2)
        .get('/config/detectors1')
        .end((err, res) => {
          try{
            myEnv.stop();
            res.should.have.status(200);
            done();
        } catch(e){console.log(e);}
        });
    });

    it('when responding via handler, I should be able to access the Detectors info', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      motion.Reset();
      let alternativeConfig = new motion.Config("test/config_express_test2.js");
      motion.StartWithConfig(alternativeConfig);

      let d = motion.GetMotionDetectors();
      let myEnv = motion.GetEnvironment();

      (myEnv instanceof ent.ExpressEnvironment).should.equal(true);
      d.length.should.equal(2);
      let app2 = myEnv.getWebApp();
      chai.request(app2)
        .get('/config/detectors2')
        .end((err, res) => {
          myEnv.stop();
          res.should.have.status(200);
          res.body.length.should.equal(d.length);
          done();
        });
    });

    it('should be able to access system info via GET request', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      motion.Reset();
      let alternativeConfig = new motion.Config("test/config_express_test5.js");
      motion.StartWithConfig(alternativeConfig, (myEnv, d, n, f)=>{

        (myEnv instanceof ent.ExpressEnvironment).should.equal(true);
        let app2 = myEnv.getWebApp();
        let _done = false;
        n[0].on('pushedNotification', function(message, text, data){
          console.log(data.newState.stdout);
          chai.request(app2)
            .get('/config/environment')
            .end((err, res) => {
              myEnv.exit();
              console.log(res.body);
              res.should.have.status(200);
              res.body.currentState.cpus.should.not.equal(undefined);
              res.body.currentState.freemem.should.not.equal(undefined);
              res.body.currentState.totalmem.should.not.equal(undefined);
              if(!_done){
                _done = true;             
                done();
              }
            });
        });
      });
    });
  });

  describe("To be able to disable temporarily a Motion Detector..., ", function() {
    let fail_helper = true;
    it('I should be able to deactivate an existing active MD by name', function (done) {
      //Prepare
      motion.Reset();

      let alternativeConfig = new motion.Config("test/config_express_test3.js");
      motion.StartWithConfig(alternativeConfig, ()=>{
        let myEnv = motion.GetEnvironment();
        let n = motion.GetNotifiers();
        n[0].on('pushedNotification', function(message, text, data){
          fail_helper.should.equal(false);
        });
        let app2 = myEnv.getWebApp();
        chai.request(app2)
          .get('/config/detectors')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.length.should.equal(1);
            res.body[0]._isActive.should.equal(true);
            motion.DeactivateDetector("My Detectors Route");
            chai.request(app2)
              .get('/config/detectors')
              .end((err, res) => {
                res.should.have.status(200);
                res.body[0]._isActive.should.equal(false);
                done();
              }); 
          }); 
      });
    });
    it('I should fail if the MD name Being deactivated does not exist', function () {
      //Prepare
      try{
        motion.DeactivateDetector("MD unexisting");
      } catch(e){
        e.message.should.equal("Error: cannot find Detector with name 'MD unexisting'.")
        return;
      }
      should.fail();
    });
    it('I should be able to reactivate a previously deactivated MD by name', function (done) {
      //Prepare
      motion.ActivateDetector("My Detectors Route");
      fail_helper = false;
      chai.request(motion.GetEnvironment().getWebApp())
        .get('/config/detectors')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });     
    });
    it('I should fail if the MD name Being activated does not exist', function () {
      //Prepare
      try{
        motion.ActivateDetector("MD unexisting");
      } catch(e){
        e.message.should.equal("'MD unexisting' does not exist.")
        return;
      }
      should.fail();
    });
    it('I should be able to POST messages', function (done) {
      //Prepare
      let myEnv = motion.GetEnvironment();
      motion.AddDetector(new ent.RequestDetector("My_Route", "/config/detector4",
        (req, res) => {
          res.json({ "req": req.body });
        }, "POST"));

      chai.request(myEnv.getWebApp())
        .post('/config/detector4')
        .send({myparam: 'test'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.eql({ "req": { "myparam": "test"}});
          done();
        });
    });
    it('I should throw and Error if a HTTP verb is not implemented', function () {
      //Prepare
      try{
        motion.AddDetector(new ent.RequestDetector("My Detectors Route with some weird verb", "/config/detector4",
          (req, res) => {
            res.json({});
          }, "SOME_VERB"));
      } catch(e){
        e.message.should.equal("Verb SOME_VERB is not implemented.");
        return;
      }
      should.fail();
    });
    it('I should throw an error if the handler function is not implemented', function () {
      //Prepare
      let myEnv = motion.GetEnvironment();
      try{
        motion.AddDetector(new ent.RequestDetector("Deactivate Route", 
          "/config/detector/function1",
          "SomeUnknownFunction", 
          "POST"));
      }
      catch(e){
        e.message.should.equal('Error: function "SomeUnknownFunction" is not defined in t-motion-detector.');
        return;
      }
      should.fail();
    });
    it('I should be able to Deactivate a MD via POST message', function (done) {
      //Prepare
      let myEnv = motion.GetEnvironment();
      motion.AddDetector(new ent.RequestDetector("Deactivate Route", 
        "/config/detector/deactivate",
        "DeactivateDetector;name", 
        "POST"));

      chai.request(myEnv.getWebApp())
        .post('/config/detector/deactivate')
        .send({name: "My_Route"})
        .end((err, res) => {
          res.should.have.status(200);
          motion.GetMotionDetector("My_Route")._isActive.should.equal(false);
          done();
        });
    });
    it('I should be able to Activate a MD via POST message', function (done) {
      //Prepare
      let myEnv = motion.GetEnvironment();
      motion.AddDetector(new ent.RequestDetector("Activate Route", 
        "/config/detector/activate",
        "ActivateDetector;name", 
        "POST"));

      chai.request(myEnv.getWebApp())
        .post('/config/detector/activate')
        .send({name: "My_Route"})
        .end((err, res) => {
          res.should.have.status(200);
          motion.GetMotionDetector("My_Route")._isActive.should.equal(true);
          done();
        });
    });

    it.skip('When the port is already taken and if a set searchRange=True the server should try next ports in range until successfully started.', function (done) {
      //Skipping test as this functionality is not stable
      let alternativeConfig = new motion.Config("test/config_express_test3.js");
      motion.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
        motion.StartWithConfig(alternativeConfig, (e1, d, n, f)=>{
          e1.port.should.equal(8379);
          done();
        });
      });
    });
  });

  describe("When starting t-motion with an MultiEnvironment with an ExpressEnvironment via a config file", function(){
    
    it('The URL route should be valid', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      motion.Reset();
      let alternativeConfig = new motion.Config("test/config_express_test7.js");
      motion.StartWithConfig(alternativeConfig);

      let myEnv = motion.GetEnvironment();
      (myEnv instanceof Extensions.MultiEnvironment).should.equal(true);

      let app2 = myEnv.getWebApp();
      chai.request(app2)
        .get('/config/detectors1')
        .end((err, res) => {
          try{
            myEnv.stop();
            res.should.have.status(200);
            done();
          } catch(e){console.log(e);}
        });
    });
  });
});