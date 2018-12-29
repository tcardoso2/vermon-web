  /*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var md = require('vermon');
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let vermon = require('vermon');
let ent = require('../Entities');
let main = require('../main.js');
let events = require('events');
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

describe("After installing a new vermon-web package", function() {
  xit('a setup web-page should exist', function () {
    //Prepare
    chai.request(main)
      .get('/setup')
      .end((err, res) => {
        res.should.have.status(200);
        done();
    });
  });
});