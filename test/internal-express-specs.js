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
    it('when I request for the list of Notifiers I should get it', function () {
      //Prepare
      should.fail();
    });
    it('3rd test', function () {
      //Prepare
      should.fail();
    });
  });
});