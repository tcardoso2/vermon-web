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

var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();
var fs = require('fs');
var t = require('t-motion-detector');
var ent = require('../Entities');
var main = require('../main.js');
var events = require('events');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  var n = undefined;
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("When a new User Story Detector is created, ", function() {
  it('user should should start story with "As"', function() {
    var n = new ent.CliNotifier("My Console Notifier");
    var d = new ent.UserStoryDetector("My User Story Detector");
    d.send("As a user... yadda yadda");
    //Fill-in callback event
    chai.assert.fail();
  });

  it('"CliNotifier" must extend BaseNotifier', function() {
    //Assumes there is some local file with the key
    var n = new ent.CliNotifier("My User Story Notifier");
    (n instanceof t.Entities.BaseNotifier).should.equal(true);
  });


  it('"UserStoryDetector" must extend BaseDetector', function() {
    //Assumes there is some local file with the key
    var n = new ent.UserStoryDetector("My User Story Detector");
    (n instanceof t.Entities.BaseDetector).should.equal(true);
  });

  it('should reply to create a new user if no users exist in store', function() {
    var n = new ent.CliNotifier("My Console Notifier");
    var d = new ent.UserStoryDetector("My User Story Detector");
 
    d.send("As a user... yadda yadda");
    var users = require('../users.js');
    //Fill-in callback event
    n.message.should.equal("No users exist in story currently, please add users to the users.js list");
  });

  it('the <user> should be followed by "I" and a verb', function () {
    chai.assert.fail();
  });

  it('should reply the verb options after the user types "I"', function() {
    chai.assert.fail();
  });

  it('should reply that no verbs are configured if storage is empty.', function() {
    chai.assert.fail();
  });

  it('should contain a "so that" portion so that the value can be expressed.', function() {
    chai.assert.fail();
  });

  it('should be tokenized at least into 3 parts <user>, <action>, <value>.', function() {
    chai.assert.fail();
  });

  it('should contain at least one acceptance criteria expressed as "given", "when", "then".', function() {
    chai.assert.fail();
  });

  it('should reply with a list of <places> when the user types "in"', function() {
    chai.assert.fail();
  });
});