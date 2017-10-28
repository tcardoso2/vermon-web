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


//Chai will use promises for async events
chai.use(chaiAsPromised);
chai.use(chaiHttp);

function helperReset(){
  motion.Reset();
  delete require.cache[require.resolve('../main')];
  main = require('../main');
  motion = main._;
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

  describe("There should be an abstraction layer CommandStdoutDetector detecting changes in log after a command is issued", function() {
    it('CommandStdoutDetector should take a line command as the second argument', function (done) {
      try{
        let d = new ent.CommandStdoutDetector("my detector");
      } catch(e){
        e.message.should.equal("The second argument 'command' is mandatory.");
        done(); 
      }
      should.fail();
    });

    it('CommandStdoutDetector should take an array of arguments as third argument', function (done) {
      try{
        let d = new ent.CommandStdoutDetector("my detector", "pwd", "Bla bla");
      } catch(e){
        e.message.should.equal("The third argument 'args' must be an Array.");
        done();  
      }
      throw new Error("Should not have reached here, check the unit test again.");
    });

    it('CommandStdoutDetector should take a line command as the 2nd args, arguments as 3rd, and a Log pattern as text to search', function (done) {
      helperReset();
      let _config = new main._.Config("/test/config_command_test1.js");
      main._.StartWithConfig(_config, (e,d,n,f) =>{
        n[0].on('pushedNotification', function(message, text, data){
          console.log(data.newState);
          data.newState.row.should.be.gt(5);
          data.newState.line.indexOf("INFO   Starting web server").should.be.gt(0);
          (data.newState.line.length-1).should.be.lt(data.newState.allData.length);
          done();
        });
      });
    });
  });

  describe("After starting express from command line", function() {
    it('--startweb should be a command to start the web server', function (done) {
      helperReset();
      let data_line = '';

      let processRef = main._.Cmd.get('node main --startweb');
      let _done = false;
      processRef.stdout.on(
        'data',
        function(data) {
          data_line += data;
          if (data_line[data_line.length-1] == '\n') {
            console.log(data_line);
            if (data_line.indexOf("INFO   Starting web server") > 0){
              if(_done) return;
              _done = true;
              done();
            }
          }
        }
      );
    });
    it('if no valid argument is passed should fail', function (done) {
      helperReset();
      let data_line = '';

      let processRef = main._.Cmd.get('node main');
      processRef.stdout.on(
        'data',
        function(data) {
          data_line += data;
          if (data_line[data_line.length-1] == '\n') {
            console.log(data_line);
            if (data_line.indexOf('ERROR Module called directly, please use "--help" to see list of commands, or use it as a dependency (via require statement) in your application.') > 0){
              done();
            }
          }
        }
      );
    });
    it('If no admin user exists should prompt to create one', function () {
      helperReset();
      let data_line = '';

      let processRef = main._.Cmd.get('node main --startweb');
      processRef.stdout.on(
        'data',
        function(data) {
          data_line += data;
          if (data_line[data_line.length-1] == '\n') {
            console.log(data_line);
            if (data_line.indexOf('ERROR Module called directly, please use "--help" to see list of commands, or use it as a dependency (via require statement) in your application.') > 0){
              done();
            }
          }
        }
      );
    });
    it('If no default config.js file exists should prompt to create one', function (done) {
      //Prepare
      helperReset();
      let data_line = '';

      let processRef = main._.Cmd.get('node main --startweb');
      let _done = false;
      processRef.stdout.on(
        'data',
        function(data) {
          data_line += data;
          if (data_line[data_line.length-1] == '\n') {
            console.log(data_line);
            if (data_line.indexOf("No config file seems to exist, to run without a config run with --defaultConfig option;") > 0){
              if(_done) return;
              _done = true;
              done();
            }
          }
        }
      );
    });
    it('If --defaultConfig is specified, then it creates a new default config', function (done) {
      //Prepare
      helperReset();
      let _config = new main._.Config("/test/config_command_test2.js");
      main._.StartWithConfig(_config, (e,d,n,f) =>{
        n[0].on('pushedNotification', function(message, text, data){
          data.newState.line.indexOf("INFO   Created a new config file").should.be.gt(0);
          done();
        });
      });
    });
    it('Should not be possible to remove System routes, started by the system (Start)', function () {
      should.fail(); //continue
    });
    it('The 2 system detector routes should be pointing to AddDetector, and RemoveDetector respectively', function () {
      should.fail(); //continue
    });
    it('Can check if a detector is Active or not via its property', function () {
      //_isActive is an Internal property! How to not hide it? it is hidden in "t-motion-detector".
      //How to call getIsActive 
      should.fail(); //continue
    });
    it('Should be able to add elements to it (Detectors, Notifiers, etc...)', function () {
      should.fail(); //continue
    });
    it('Should be able to delete elements to it (Detectors, Notifiers, etc...)', function () {
      should.fail(); //continue
    });
    it('Should be able to redirect to login page if User admin exists but is not logged in.', function () {
      should.fail(); //continue
    });
  });
});

describe("When accessing the entry page", function() {
  it('I should be prompted for OTP pass-code', function () {
    should.fail(); //continue
  });

  it('I should send the OTP to the slack channel', function () {
    should.fail(); //continue
  });

  it('When entering that OTP pass the system should allow access to the sensors page', function () {
    should.fail(); //continue
  });

  it('I should be able to enter in listening mode', function () {
    should.fail(); //continue
  });

  it('I should be able to capture a radio signal and save it', function () {
    should.fail(); //continue
  });

  it('I should be able to reproduce that same signal', function () {
    should.fail(); //continue
  });

  it('I should be able to detect the signal I sent', function () {
    should.fail(); //continue
  });
});