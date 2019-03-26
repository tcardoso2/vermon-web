/*****************************************************
 * Internal tests
 * What are internal tests?
 * As this is a npm package, it should be tested from
 * a package context, so I'll use "interal" preffix
 * for tests which are NOT using the npm tarball pack
 * For all others, the test should obviously include
 * something like:
 * var vermon = require('vermon');
 *****************************************************/

//During the test the env variable is set to test
process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let should = chai.should()
let fs = require('fs')
let ent = require('../Entities')
let main = require('../main')
let events = require('events')
let express = require('express')
let chaiHttp = require('chai-http')
let expect = chai.expect
let vermon = require('vermon')


//Chai will use promises for async events
chai.use(chaiAsPromised)
chai.use(chaiHttp)

//vermon will use express
vermon.use(main)

function helperReset(){
  vermon.reset()
  delete require.cache[require.resolve('../main')]
  delete require.cache[require.resolve('vermon')]
  //delete require.cache[require.resolve('chai-http')];
  main = require('../main')
  vermon = require('vermon')
  mainEnv = {}
  //chaiHttp = require('chai-http');
  //chai.use(chaiAsPromised);
  //chai.use(chaiHttp);
}

before(function(done) {
  var n = undefined
  done()
})

after(function(done) {
  // here you can clear fixtures, etc.
  done()
})

var mainEnv
//Our parent block
describe('Before the test...', () => {
  beforeEach((done) => { //Before each test we empty the database
    //Do something
    //vermon.reset();
    done()
  })

  /*
  * Test the /GET route
  */

  describe('After starting express from main', function() {
    xit('If ran directly from command line should not proceed without a proper command.', (done) => {
      this.timeout(5000)
      vermon.Cmd.get('node main',(err, data, stderr) => {
        err.message.should.not.equal(null)
        stderr.should.not.equal('')
        stderr.indexOf('Module was called directly from the console without any arguments, this is not allowed.').should.be.gt(0)
        done()
      })
    })

    it('I should GET a Welcome message, on the welcome path, when calling Listen()', (done) => {
      //Works when the module is called individually but seems not to work when called in bulk
      helperReset()
      vermon.use(main)
      //This is just a basic test, so all i need to do is start.
      main.start()
      chai.request(main.getWebApp())
        .get('/welcome')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.eql({message: 'Welcome to Vermon Web server!'})
          done()
        })
    })

    it('"/config/detectors" should return an array of 8 System Detectors', function (done) {
      //Prepare
      helperReset()
      //This is the proper wat to start the web server
      vermon.use(main)
      vermon.configure('test/config_express_only_test.js')
      vermon.watch().then((data) => {
        vermon.should.not.equal(undefined)
        chai.request(main.getWebApp())
          .get('/config/detectors')
          .end((err, res) => {
            res.should.have.status(200)
            res.ok.should.equal(true)
            vermon.GetMotionDetectors().length.should.equal(8)
            res.body.length.should.equal(8)
            done()
          })
      }).catch((e) => {
        should.fail()
      })
    })

    it('After Reseting the environment, if I try to get the environment without initializing after Reset, I should get an error that Environment does not exist.', function () {
      //Prepare
      helperReset()
      try{
        let myEnv = vermon.GetEnvironment()
      } catch(e) {
        e.message.should.equal('Environment does not exist. Please run the Start() function first or one of its overrides.')
        return
      }
      should.fail()
    })

    it('Plugins should also implement the "Reset" method which is run when the main.reset() method is called, via event handler', function (done) {
      //Prepare
      helperReset()
      vermon.use(main);
      let _done = false
      main.on('reset', ()=>{
        if (_done) return
        _done = true
        console.log('Test: Called done')
        done()
      })
      vermon.reset()
    })
    xit('When running vermon.watch with a config file without an ExpressEnvironment, the system should not Start the Web Server.', function (done) {
      //Skipping for now, this works manually but via tests is failing...
      //Prepare
      helperReset()
      vermon.use(main)
      let emptyConfig = new vermon.Config('/test/config_empty_test.js')
      vermon.use(emptyConfig)
      vermon.watch().then(emptyConfig, (e,d,n,f) =>{
        chai.request(main.getWebApp())
          .get('/config/detectors')
          .end((err, res) => {
            (res == undefined).should.equal(true)
            done()
          })
      })
    })

    it('When running vermon with a config file with only the ExpressEnvironment, the system should setup detectors to add and remove elements, and route for EnvironmentSystem, and Deactivate/Activate Detectors + Get detectors and Get Notifiers (total 8)', function (done) {
      //Prepare
      helperReset()
      //vermon.PluginManager.GetPlugins().should.not.eql({})

      let emptyConfig = new vermon.Config('/test/config_express_only_test.js')
      vermon.configure(emptyConfig)
      vermon.watch().then((e,d,n,f) =>{
        (e instanceof ent.ExpressEnvironment).should.equal(true)
        e.port.should.equal(8088)
        //listen needs to be called explicitely before taking any request
        //e.listen();
        chai.request(main.getWebApp())
          .get('/config/detectors')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.length.should.equal(8)  //AddDetector, AddNotifier, RemoveNotifier, GetEnvironment + 2 for Activate/Deactivate Detectors, Get Detectors, Get Notifiers
            res.body[0]._isActive.should.equal(true)
            done()
          })
      })
    })
  })

  describe('Plugin tests:', function() {
    it('vermon-web plugin should have an Id', function (done) {
      //Prepare
      helperReset()
      main.id.should.equal('VERMON_WEB')
      done()
    })

    it('vermon-web plugin should be added with the vermon.use function', function (done) {
      //Prepare
      helperReset()
      vermon.use(main)
      vermon.should.not.equal(undefined)
      vermon.PluginManager.GetPlugins().should.not.eql({})
      done()
    })

    it('When including a plugin, GetPlugins should return that plugin', function () {
      helperReset()
      vermon.use(main)
      vermon.PluginManager.GetPlugins().should.not.eql({})
    })

    it('should be possible to activate the plugin after use / configure / watch.', function (done) {
      //Prepare
      helperReset()
      //let alternativeConfig = new vermon.Config('/test/config_express_test.js')
      vermon.use(main)
      vermon.configure('/test/config_express_test.js')
      vermon.watch().then((data) => {
        (data.environment instanceof ent.ExpressEnvironment).should.equal(true)
        data.detectors.length.should.equal(2)
        data.notifiers.length.should.equal(1)
        done()
      })
    })

    it('A vermon plugin should not include vermon library! Important! should be injected instead, .', function (done) {
      helperReset()
      setTimeout(()=> {
        //Vermon is not present if vermon.use is not run (not injected yet)
        (main._ === undefined).should.equal(true)
        vermon.use(main);
        //Now it should exist
        (main._ === undefined).should.equal(false)
        main._.should.be.eql(vermon)
        //console.log('Checking if parent is injected')    
        //(vermon.GetMotionDetectorsNonSingleton === undefined).should.equal(true)
        //(vermon.GetMotionDetectorsNonSingleton == main.GetMotionDetectorsNonSingleton).should.equal(true)
        //console.log('Checking if plugin entities is injected')  
        //(main.entities.vermon == vermon).should.equal(2);
        done()      
      }, 1000)
    });
  })

  describe('When starting vermon with an ExpressEnvironment programatically', function(){
    
    it('when I pass a custom config file, the app should know whats my current working directory.', function () {
      //Prepare
      let alternativeConfig = new vermon.Config('/test/config_express_test.js')
      alternativeConfig.isFallback().should.equal(false)
      alternativeConfig.cwd().should.equal(process.cwd() + '/')
    })

    it('ExpressEnvironment should inherit Environment class', function () {
      mainEnv = new ent.ExpressEnvironment();
      (mainEnv instanceof vermon.Entities.Environment).should.equal(true)
    })

    it('it should start a web-server at default port 8123', function (done) {
      helperReset()
      //Old syntax - Still possible
      mainEnv = new ent.ExpressEnvironment(8123, 'public') 
      vermon.Start({ environment: mainEnv})
      let app = mainEnv.getWebApp()
      chai.request(app)
        .get('/site')
        .end((err, res) => {
          mainEnv.stop()
          mainEnv.getPort().should.equal(8123)
          mainEnv.getStaticAddr().should.equal('public')
          res.should.have.status(200)
          done()
        })
    })
    
    xit('it should be able to stop the web-server', function (done) {
      //TODO: Not able for now to test this properly
      let e = new ent.ExpressEnvironment()
      e.stop()
      done()
    })

    it('should be able to take the first parameter in the constructor as being the port', function (done) {
      let e2 = new ent.ExpressEnvironment(8030) 
      //Old syntax - Still possible
      vermon.Start({ environment: e2})
      let app2 = e2.getWebApp()
      chai.request(app2)
        .get('/site')
        .end((err, res) => {
          e2.getPort().should.equal(8030)
          res.should.have.status(200)
          done()
          e2.stop()
        })
    })

    it('it should be able to serve static content', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp()
      mainEnv.setStatic('public')
      chai.request(app)
        .get('/test.html')
        .end((err, res) => {
          res.should.have.status(200)
          res.text.should.equal('This is a test file!')
          done()
        })
    })

    it('js folder should exist with angular.js library', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp()
      chai.request(app)
        .get('/js/angular.min.js')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })

    it('main index html file should exist', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp()
      chai.request(app)
        .get('/site/index.html')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })

    it('js folder should exist with angular.js library', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp()
      chai.request(app)
        .get('/js/angular.min.js')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })

    it('js folder should exist with app.js client library for Model and Controller', function (done) {
      //In this test we are just reusing the same server
      let app = mainEnv.getWebApp()
      chai.request(app)
        .get('/js/app.js')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  })

  describe('When starting vermon with an ExpressEnvironment and RequestDetector', function(){
    it('It should be possible to configure a route.', function (done) {
      //Prepare
      helperReset()
      mainEnv = new ent.ExpressEnvironment(8123, 'public') 
      let md = new ent.RequestDetector('My route detector', '/config/mylink', (req, res) => {
        try{
          res.json(vermon.GetMotionDetectors())
        } catch(e) {
          console.error(e)
        }
      })
      md.name = 'My Route detector'
      //Old syntax - Still possible
      vermon.Start({
        environment: mainEnv,
        initialMotionDetector: md,
      })

      let detectors = vermon.GetMotionDetectors()
      let pirDetector = detectors[0]
      let app = mainEnv.getWebApp()
      //Assert
      chai.request(app)
        .get('/config/mylink')
        .end((err, res) => {
          //Stopping so that next test can run
          mainEnv.stop()
          res.should.have.status(200)
          console.log(res.body)
          res.body.length.should.equal(1)
          res.body[0].name.should.equal(pirDetector.name)
          //res.body.should.be.eql([{ PIRMotiondetector: { name: pirDetector.name, pin: pirDetector.pin } }]);
          done()
        })
    })
  })

  describe('When starting vermon with an ExpressEnvironment via a config file', function(){
    
    it('The URL route should be valid', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      helperReset()
      vermon.use(main)
      let alternativeConfig = new vermon.Config('test/config_express_test.js')
      vermon.configure(alternativeConfig)
      vermon.watch().then(() => {
        let myEnv = vermon.GetEnvironment()

        let app2 = myEnv.getWebApp()
        chai.request(app2)
          .get('/config/detectors1')
          .end((err, res) => {
            try{
              myEnv.stop()
              res.should.have.status(200)
              done()
            } catch(e){console.log(e)}
          })        
      })
    })

    it('when responding via handler, I should be able to access the Detectors info', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      helperReset()
      vermon.use(main)
      let alternativeConfig = new vermon.Config('test/config_express_test2.js')
      vermon.configure(alternativeConfig)
      vermon.watch().then(()=>{
        let d = vermon.GetMotionDetectors()
        let myEnv = vermon.GetEnvironment();

        (myEnv instanceof ent.ExpressEnvironment).should.equal(true)
        d.length.should.equal(2)
        let app2 = myEnv.getWebApp()
        chai.request(app2)
          .get('/config/detectors2')
          .end((err, res) => {
            myEnv.stop()
            res.should.have.status(200)
            res.body.length.should.equal(d.length)
            done()
          })        
      })
    })

    it('should be able to access system info via GET request', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      helperReset()
      vermon.use(main)
      let alternativeConfig = new vermon.Config('test/config_express_test5.js')
      vermon.configure(alternativeConfig)
      //Old syntax
      vermon.watch().then(alternativeConfig, ({ myEnv, d, n, f })=>{

        (myEnv instanceof ent.ExpressEnvironment).should.equal(true)
        let app2 = myEnv.getWebApp()
        let _done = false
        n[0].on('pushedNotification', function(message, text, data){
          console.log(data.newState.stdout)
          chai.request(app2)
            .get('/config/environment')
            .end((err, res) => {
              myEnv.exit()
              console.log(res.body)
              res.should.have.status(200)
              res.body.currentState.cpus.should.not.equal(undefined)
              res.body.currentState.freemem.should.not.equal(undefined)
              res.body.currentState.totalmem.should.not.equal(undefined)
              if(!_done){
                _done = true             
                done()
              }
            })
        })
      })
    })
  })

  describe('vermon.force function must work within a plugin', function() {
    it('should force adds', function (done) {
      //implement
      //Also think of separating Entities into Entities core in vermon
      should.fail()
    })
  })

  describe('BULK To be able to disable temporarily a Motion Detector (all tests in the describe section must be run)..., ', function() {
    let fail_helper = true
    it('I should be able to deactivate an existing active MD by name', function (done) {
      //Prepare
      helperReset()
      vermon.use(main)
      vermon.force(true) //Allow forcing adds
      let alternativeConfig = new vermon.Config('test/config_express_test3.js')
      vermon.configure(alternativeConfig)
      vermon.watch().then(()=>{
        let myEnv = vermon.GetEnvironment()
        let n = vermon.GetNotifiers()
        n[0].on('pushedNotification', function(message, text, data){
          fail_helper.should.equal(false)
        })
        let app2 = myEnv.getWebApp()
        chai.request(app2)
          .get('/config/detectors')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.length.should.equal(1)
            res.body[0]._isActive.should.equal(true)
            vermon.DeactivateDetector('My Detectors Route')
            chai.request(app2)
              .get('/config/detectors')
              .end((err, res) => {
                res.should.have.status(200)
                res.body[0]._isActive.should.equal(false)
                done()
              }) 
          }) 
      })
    })
    it('I should fail if the MD name Being deactivated does not exist', function () {
      //Prepare
      try{
        vermon.DeactivateDetector('MD unexisting')
      } catch(e){
        e.message.should.equal('Error: cannot find Detector with name \'MD unexisting\'.')
        return
      }
      should.fail()
    })
    it('I should be able to reactivate a previously deactivated MD by name', function (done) {
      //Prepare
      vermon.ActivateDetector('My Detectors Route')
      fail_helper = false
      chai.request(vermon.GetEnvironment().getWebApp())
        .get('/config/detectors')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })     
    })
    it('I should fail if the MD name Being activated does not exist', function () {
      //Prepare
      try{
        vermon.ActivateDetector('MD unexisting')
      } catch(e){
        e.message.should.equal('\'MD unexisting\' does not exist.')
        return
      }
      should.fail()
    })
    it('I should be able to POST messages', function (done) {
      //Prepare
      let myEnv = vermon.GetEnvironment()
      vermon.AddDetector(new ent.RequestDetector('My_Route', '/config/detector4',
        (req, res) => {
          res.json({ 'req': req.body })
        }, 'POST'))

      chai.request(myEnv.getWebApp())
        .post('/config/detector4')
        .send({myparam: 'test'})
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.eql({ 'req': { 'myparam': 'test'}})
          done()
        })
    })
    it('I should throw and Error if a HTTP verb is not implemented', function () {
      //Prepare
      try{
        vermon.AddDetector(new ent.RequestDetector('My Detectors Route with some weird verb', '/config/detector4',
          (req, res) => {
            res.json({})
          }, 'SOME_VERB'))
      } catch(e){
        e.message.should.equal('Verb SOME_VERB is not implemented.')
        return
      }
      should.fail()
    })
    it('I should throw an error if the handler function is not implemented', function () {
      //Prepare
      let myEnv = vermon.GetEnvironment()
      try{
        vermon.AddDetector(new ent.RequestDetector('Deactivate Route', 
          '/config/detector/function1',
          'SomeUnknownFunction', 
          'POST'))
      }
      catch(e){
        e.message.should.equal('Error: function "SomeUnknownFunction" is not defined in vermon.')
        return
      }
      should.fail()
    })
    it('I should be able to Deactivate a MD via POST message', function (done) {
      //Prepare
      let myEnv = vermon.GetEnvironment()
      vermon.AddDetector(new ent.RequestDetector('Deactivate Route', 
        '/config/detector/deactivate',
        'DeactivateDetector;name', 
        'POST'))

      chai.request(myEnv.getWebApp())
        .post('/config/detector/deactivate')
        .send({name: 'My_Route'})
        .end((err, res) => {
          res.should.have.status(200)
          vermon.GetMotionDetector('My_Route')._isActive.should.equal(false)
          done()
        })
    })
    it('I should be able to Activate a MD via POST message', function (done) {
      //Prepare
      let myEnv = vermon.GetEnvironment()
      vermon.AddDetector(new ent.RequestDetector('Activate Route', 
        '/config/detector/activate',
        'ActivateDetector;name', 
        'POST'))

      chai.request(myEnv.getWebApp())
        .post('/config/detector/activate')
        .send({name: 'My_Route'})
        .end((err, res) => {
          res.should.have.status(200)
          vermon.GetMotionDetector('My_Route')._isActive.should.equal(true)
          done()
        })
    })

    xit('When the port is already taken and if a set searchRange=True the server should try next ports in range until successfully started.', function (done) {
      //Skipping test as this functionality is not stable
      let alternativeConfig = new vermon.Config('test/config_express_test3.js')
      vermon.startWithConfig(alternativeConfig, (e, d, n, f)=>{
        vermon.startWithConfig(alternativeConfig, (e1, d, n, f)=>{
          e1.port.should.equal(8379)
          done()
        })
      })
    })
  })

  describe('When starting vermon with an MultiEnvironment with an ExpressEnvironment via a config file', function(){
    //Failing because is reaching 11 event emiter limit
    it('should be possible to GET an http response', function (done) {
      //Prepare
      //Main needs to be reset explicitely because it keeps objects from previous test
      helperReset()
      let alternativeConfig = new vermon.Config('test/config_express_test7.js')
      vermon.use(main)
      vermon.configure(alternativeConfig)
      vermon.watch().then(({ e1, d, n, f } )=>{
        let myEnv = vermon.GetEnvironment();
        (myEnv instanceof ent.MultiEnvironment).should.equal(true)
     
        let myExpressEnv = myEnv.getCurrentState()['Express Environment'];
        //Another alternative way to get the Express Environment is via the function on the main module, why don't I test that as well...
        (main.GetExpressEnvironment() instanceof ent.ExpressEnvironment).should.equal(true) 

        myExpressEnv.getPort().should.equal(8380)
        //let app2 = myExpressEnv.getWebApp();
        let url = '/config/detectors'
        console.log(`Requesting URL ${url}...`)
        d.length.should.equal(1)
        console.log(d);
        (d[0] instanceof ent.RequestDetector).should.equal(true)
        d[0].route.should.equal(url)
        chai.request('http://localhost:8380')
          .get('/site')
          .end((err, res) => {
            try{
              myExpressEnv.stop()
              res.should.have.status(200)
              done()
            } catch(e){console.log(e)}
          })
      })
    }).timeout(5000)

    xit('it should be able to bind the Request Detector to the express environment and able to GET an HTTP response from that URL', function (done) {
      this.timeout(5000)
      let url = '/config/detectors/'
      //TODO: Need to implement by default the Detectors get added to all Environments 
      chai.request(main.getExpressEnvironment().getWebApp())
        .get(url)
        .end((err, res) => {
          res.should.have.status(200)
          done() 
        }) 
    })
  })
})
