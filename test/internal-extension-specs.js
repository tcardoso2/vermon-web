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

before(function(done) {
  done();
});

after(function(done) {
  done();
});

describe("When creating a t-motion-detector-cli extension, ", function() {

  it('It should be able to access the t-motion-detector Entities via the "$" accessor.', function (done) {
     //Prepare
    let Entities = main.$.Entities;
    done();
  });
  it('The developer should link both libraries using the AddPlugin function.', function (done) {
     //Prepare
    main.$.Reset();
    let alternativeConfig = new main.$.Config("/test/config_express_test3.js");

    main.$.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      
      done();
    });
  });
});

describe("When creating a NetworkDetector, ", function() {

  it('It should detect the current discoverable nodes present in the network.', function (done) {
    //Prepare
    
    main.$.Reset();
    let alternativeConfig = new main.$.Config("/test/config_express_test4.js");
    let detected = false;

    main.$.StartWithConfig(alternativeConfig, (e, d, n, f)=>{
      n[0].on('pushedNotification', function(notifierName, text, data){
        console.log("CONSOLE:", data.newState.stdout.data);
        if (!detected){
          data.newState.stdout.data.should.include("1 packets transmitted, 1 packets received, 0.0% packet loss");
          if(data.newState.stdout.data.indexOf("127.0.0.1") > 0)
          { 
            detected = true;
            text.should.equal("'Default Base Notifier' received Notification received from: 'Network Detector'");
            done();
          }
        }
      });      
    });
  });
});