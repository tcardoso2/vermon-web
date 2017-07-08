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
let motion = main.md;
let Entities = motion.Entities;


//Chai will use promises for async events
chai.use(chaiAsPromised);
chai.use(chaiHttp);

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
    it('I should GET a Welcome message, on the welcome path', (done) => {
      chai.request(main)
        .get('/welcome')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({message: 'Welcome to T-Motion-CLI Web server!'});
          done();
      });
    });

    it('"/config/detectors" should return an array of 2', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      chai.request(main)
        .get('/config/detectors')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.equal(2);
          done();
      });
    });
    
    it('After Reseting the environment, if I try to get the environment without initializing after Reset, I should get an error that Environment does not exist.', function () {
      //Prepare
      motion.Reset();
      try{
        let myEnv = motion.GetEnvironment();
      } catch(e) {
        e.message.should.equal("Environment does not exist. Please run the Start() function first or one of its overrides.");
        return;
      }
      should.fail();
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
      mainEnv = new ent.ExpressEnvironment(8123) 
      motion.Start({ environment: mainEnv});
      let app = mainEnv.getWebApp();
      chai.request(app)
        .get('/')
        .end((err, res) => {
          mainEnv.stop();
          mainEnv.getPort().should.equal(8123)
          res.should.have.status(200);
          done();
        });
    });
    
    it('it should be able to stop the web-server', function (done) {
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
      //TODO: Work on decorators for making members visible?
      motion.Reset();
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

    it('when responding via handler, I should be able to access the Detectors and Notifiers info', function (done) {
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
          res.body.should.be.eql({});
          res.length.should.equal(d.length);
          done();
        });
    });

  });
});