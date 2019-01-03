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
let ent = require('../Entities.js')
let main = require('../main.js')
let chaiHttp = require('chai-http')
let io = require('socket.io')()
let motion = main._
let client = require('socket.io-client')
let socket = client('http://localhost:2999')

//Chai will use promises for async events
chai.use(chaiAsPromised)
//Chai will use promises for async events
chai.use(chaiHttp)

function helperReset(){
  motion.Reset()
  delete require.cache[require.resolve('../main')]
  main = require('../main')
  motion = main._
}
before(function(done) {
  done()
})

after(function(done) {
  // here you can clear fixtures, etc.
  main.Reset()
  done()
})

var socketNoti
var socketDetector

describe('When a SocketIONotifier is created, ', function() {
  it('Should inherit the Notifier class', function () {
    socketNoti = new ent.SocketIONotifier('Socket Notifier 1');
    (socketNoti instanceof motion.Entities.BaseNotifier).should.equal(true)
  })

  it('Should be able to stop an existing Socket Notifier - Part 1 check that the socket disconnect event runs', function (done) {
    this.timeout(5000)
    socket.on('connect', function(){
      //This should run because an existing socket is open
      console.log('Connected!')  //TODO: Substitute by the tmd logger
      socketNoti.stop()
    })
    let _func = function(){
      console.log('Disconnected!')  //TODO: Substitute by the tmd logger
      done()
      socket.removeListener('disconnect', _func)
      socket.close()
      socket.destroy()
    }
    socket.on('disconnect', _func)
  })

  it('It should listen by default on port 2999 (Standalone)', function (done) {
    socketNoti = new ent.SocketIONotifier('Socket Notifier 2')
    let _done = false
    newSocket = client('http://localhost:2999')
    let _func = function(){
      socketNoti.stop()
      done()
      //Cleaning up
      newSocket.removeListener('connect', _func)
      newSocket.close()
      newSocket.destroy()
    }
    newSocket.on('connect', _func)
    newSocket.on('event', function(data){})
    newSocket.on('disconnect', function(){})
  })

  it('Should be able to stop an existing Socket Notifier - Part 2 check that previous Notifiers do not trigger connect events', function (done) {
    const nc = ent.GetHistoricalSocketConnections()
    newSocket = client('http://localhost:2999')
    newSocket.on('connect', function(data){
      console.log(`New Socket received 'connect' event with data ${data}`)
      //Only one new connection should have happened
      ent.GetHistoricalSocketConnections().should.equal(nc + 1)
      socketNoti.stop()
      newSocket.close()
      newSocket.destroy()
      done()
    })
    socketNoti = new ent.SocketIONotifier('Socket Notifier 3')
  })

  it('It should be able to send events', function (done) {
    _done = false
    newSocket = client('http://localhost:2999')
    newSocket.on('connect', function(){})
    newSocket.on('broadcast', function(data){
      data.should.be.eql({
        'newState': 'socket_is_connected',
        'oldState': null,
        'text': 'You are now connected to Socket Notifier 4!'
      })
      if(!_done) {
        _done = true
        done()
        socketNoti.stop()
        newSocket.close()
        newSocket.destroy()
      }
    })
    newSocket.on('disconnect', function(){})
    socketNoti = new ent.SocketIONotifier('Socket Notifier 4')
  })
})

describe('When a SocketDetector is created, ', function() {
  it('Should inherit the Detector class', function () {
    socketDetector = new ent.SocketIODetector('socket 1');
    (socketDetector instanceof motion.Entities.MotionDetector).should.equal(true)
  })

  xit('It should connect by default on port 2999 (Standalone)', function (done) {
    socketNoti = new ent.SocketIONotifier('Socket Notifier 5')
    socketDetector = new ent.SocketIODetector('socket 2')
    socketDetector.on('hasDetected', (intensity, data, newState, source, detector)=>{
      data.should.be.eql('will fail')
      done()
    })
    socketDetector.startMonitoring()
  })

  xit('It should be able to set a specific URL in the constructor', function (done) {
    let e = new ent.SocketIONotifier('Socket Notifier 6')
    socket.on('connect', function(){
      done()
    })
    socket.on('event', function(data){})
    socket.on('disconnect', function(){})
  })

  xit('It should be able to receive events from the server', function (done) {
    let e = new ent.SocketIONotifier('Socket Notifier 6')
    socket.on('connect', function(){
      done()
    })
    socket.on('event', function(data){})
    socket.on('disconnect', function(){})
  })
})