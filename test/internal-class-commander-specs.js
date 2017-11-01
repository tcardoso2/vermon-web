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
let chaiHttp = require('chai-http');
let expect = chai.expect;
let Commander = require('../Commander').Commander;

//Chai will use promises for async events
chai.use(chaiAsPromised);
chai.use(chaiHttp);

function helperReset(){
}

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

//Our parent block
describe('Before the test...', () => {
    beforeEach((done) => { //Before each test we empty the database
      //Do something
      //motion.Reset();
      done();
    });

  describe("There should be a Commander class which", function() {
    it('should exist in the Commander.js file', function (done) {
      let c = consider.a.command();
      //User consider instead!
      done();
    });
    it('should allow creating CLI commands', function (done) {
      should.fail();
    });
    it('should be allowed to check commands in sequence via .check(...).then(...)', function (done) {
      let c = new Commander();
      c.check("someCommand", (error, then)=>{
        //continue from here!
        then.check("anotherCommand", (error, then)=>{
          then.finalize();
        });
      })
      should.fail();
    });
    it('in case a check fails should be possible to return a message to the user to say a command is required', function (done) {
      let c = new Commander();
      c.check("someCommand", (error, then)=>{
        if(error) then.returnToUser(some_message);
        then.check("anotherCommand", (error, then)=>{
          then.finalize();
        });
      })
      should.fail();
    });
    it('should be able to set a precondition for which the command should be successful', function (done) {
      let c = new Commander();
      c.check("someCommand").precondition(()=>{
        return false;
      });
      should.fail();
    });    
  });
});