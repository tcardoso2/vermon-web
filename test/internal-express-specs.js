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
let main = require('../main.js');
let events = require('events');
let express = require('express');
let chaiHttp = require('chai-http');
let expect = chai.expect;


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

    it('1st test', function () {
      //Prepare
      should.fail();
    });
    it('2nd test', function () {
      //Prepare
      should.fail();
    });
    it('3rd test', function () {
      //Prepare
      should.fail();
    });
  });
});