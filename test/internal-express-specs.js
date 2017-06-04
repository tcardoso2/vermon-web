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
let t = require('t-motion-detector');
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

//Our parent block
describe('Before: ', () => {
    beforeEach((done) => { //Before each test we empty the database
      //Do something
      done();
    });

  /*
  * Test the /GET route
  */
  describe("After starting express", function() {
    it('it should GET a Welcome message', (done) => {
      chai.request(main)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({message: 'Welcome!'});
          done();
      });
    });

    it('when I pass a custom config file, the app should know whats my current working directory.', function () {
      //Prepare
      let alternativeConfig = new motion.Config("/test/config_express_test.js");
      alternativeConfig.isFallback().should.equal(false);
      alternativeConfig.cwd().should.equal(process.cwd() + "/");
    });

    it('when I request for the list of Notifiers I should get it', function () {
      //Prepare
      should.fail();
    });
  });

  describe("When starting t-motion with an ExpressNotifier", function(){
    
    it('it should start a web-server at default port 8080', function (done) {
      let n = new ent.ExpressNotifier() 
      if(motion.AddNotifier(n))
      {
        let app = n.getWebApp();
        chai.request(app)
          .get('/')
          .end((err, res) => {
            n.getPort().should.equal(8080)
            res.should.have.status(200);
            done();
        });
      }
      else{
        should.fail();
      }
    });
    
    it('it should be able to start a server if I declare the ExpressNotifier via Config file', function (done) {
      let n = new ent.ExpressNotifier();
      n.stop();
    });

    it('it should be able to stop the web-server', function (done) {
      let n = new ent.ExpressNotifier();
      n.stop();
    });

    it('should be able to take the first parameter in the constructor as being the port', function () {
      let n2 = new ent.ExpressNotifier(8033) 
      if(motion.AddNotifier(n2))
      {
        let app2 = n2.getWebApp();
        chai.request(app2)
          .get('/')
          .end((err, res) => {
            n2.getPort().should.equal(8033)
            res.should.have.status(200);
            done();
        });
      }
      else{
        should.fail();
      }
    });

    it('it should be able to serve static content', function (done) {
      should.fail();
    });

    it('when I request for the list of Motion detectors I should get it', function (done) {
      //Prepare
      let alternativeConfig = new motion.Config("test/config_express_test.js");
      motion.StartWithConfig(alternativeConfig);

      let detectors = motion.GetMotionDetectors();
      detectors.length.should.equal(1);
      let pirDetector = detectors[0];
      alternativeConfig.isFallback().should.equal(false);
      pirDetector.name.should.equal("unnamed detector.");
      //Assert
      chai.request(main)
        .get('/config/detectors')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.eql({message: [{ PIRMotiondetector: { name: pirDetector.name, pin: pirDetector.pin } }]});
          done();
      });
    });

  });

  describe("When detecting movement on a setup with a ExpressNotifier", function(){
    
    it('The server should receive a request to a pre-determined page', function (done) {
    
    });
  });
});