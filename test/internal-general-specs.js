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

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let should = chai.should()
let fs = require('fs')
let vermon = require('vermon')
let ent = require('../Entities')
let main = require('../main.js')
let events = require('events')

//Chai will use promises for async events
chai.use(chaiAsPromised)

before(function(done) {
  done()
})

after(function(done) {
  // here you can clear fixtures, etc.
  done()
})

describe('Best practices:', function() {
  xit('1) should not be used console.log nowhere in the code', function () {
    should.fail()
  })
})
