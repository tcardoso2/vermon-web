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
let t = require('t-motion-detector');
let ent = require('../Entities');
let main = require('../main.js');
let events = require('events');

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

describe("After installing a new t-motion-detector, ", function() {
  it('a setup executable should run/exist (postinstall)', function () {
    //Prepare

    should.fail();
  });
  it('should prompt if the user wishes to exit or setup', function () {
    //Prepare
    should.fail();
  });
  it('should allow the user set options from a list (e.g. slack, raspbian camera, etc)', function () {
    //Prepare
    should.fail();
  });
});