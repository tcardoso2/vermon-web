let vermonWeb = require('../../main.js');
let fs = require('fs')
let entities = vermon.Entities
let logger = vermon.logger
let chai = require('chai')
let chaiHttp = require('chai-http');
let vermon = require('vermon');
chai.use(chaiHttp);
let should = chai.should()
let defaultConfig = require('../../config.js')

before(function (done) {
  done()
})

after(function (done) {
  // here you can clear fixtures, etc.
  done()
})

describe('Basic new syntax, ', function () {
  describe('use / configure ', function () {
    it('use / configure (needs to be done before starting vermon)', function () {
      vermon.setLogLevel('info')
      vermon.use(vermonWeb)
      vermon.configure()
      // No errors should happen
    })

  });

  describe('watch ', function () {
    it('watch: (replacer for former StartWithConfig)', function (done) {
      vermon.reset()
      vermon.use(vermonWeb)
      vermon.configure()
      vermon.watch().then((environment) => {
  	  	logger.info(`Watching environment ${environment.name}.`)
  	  	done()
      }).catch((e) => {
  	  	should.fail()
      })
    })
  });

  describe('save ', function () {
    it('save: (replacer for former SaveAllToConfig)', function (done) {
      vermon.reset()
      vermon.use(vermonWeb)
      vermon.configure('test/config_test4.js')
      vermon.watch().then((environment, detectors) => {
        vermon.save('./test/vermon/config._example.js', (status, message) => {
          // Check file exists
          if (fs.existsSync('./test/vermon/config._example.js')) {
          } else {
            should.fail()
          }
          status.should.equal(0)
          done()
        }, true)
      })
    })
  })
})
