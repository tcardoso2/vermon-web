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
let vermon = require('vermon');
let ent = require('../Entities');
let main = require('../main.js');
let events = require('events');
let DecisionNode = ent.DecisionNodeDetector;

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("When a Decision Tree environment is created", function() {
  it('Should inherit the Environment class', function () {
    let e = new ent.DecisionTreeEnvironment(2);
    (e instanceof vermon.Entities.Environment).should.equal(true);
  });

  it('Should take the initial number of nodes as parameter', function () {
    let e = new ent.DecisionTreeEnvironment(4);
    e.countNodes().should.equal(4);
  });

  it('if no parameter is passed, results in an error', function () {
    try{
      let e = new ent.DecisionTreeEnvironment();
    } catch(e){
      e.message.should.equal("ERROR: Number of nodes is mandatory and cannot equal 0.");
      return;
    }
    should.fail();
  });

  it('if parameter = 0 results in an error', function () {
    try{
      let e = new ent.DecisionTreeEnvironment();
    } catch(e){
      e.message.should.equal("ERROR: Number of nodes is mandatory and cannot equal 0.");
      return;
    }
    should.fail();
  });

  it('Parameter should be an integer', function () {
    try{
      let e = new ent.DecisionTreeEnvironment("test");
    } catch(e){
      e.message.should.equal("ERROR: Number of nodes must be a number.");
      return;
    }
    should.fail();
  });

  it('Nodes cannot be more than 100', function () {
    try{
      let e = new ent.DecisionTreeEnvironment(101);
    } catch(e){
      e.message.should.equal("ERROR: Number must be between 1-100");
      return;
    }
    should.fail();
  });
  it('Nodes cannot be negative', function () {
    try{
      let e = new ent.DecisionTreeEnvironment(-1);
    } catch(e){
      e.message.should.equal("ERROR: Number must be between 1-100");
      return;
    }
    should.fail();
  });
  it('Nodes must be of DecisionNode instance', function () {
    let e = new ent.DecisionTreeEnvironment(1);
    (e.nodes[0] instanceof DecisionNode).should.equal(true);
  });
  it('function addNode must take a DecisionNode instance as first parameter', function () {
    let e = new ent.DecisionTreeEnvironment(1);
    try{
      e.addNode();
    }catch(e){
      e.message.should.equal("ERROR: Parameter of 'addNode' method must be of instance DecisionNodeDetector.");
      return;
    }
    should.fail();
  });
  it('DecisionNodes must have a statement describing what will be tested.', function () {
    try{
      let e = new ent.DecisionTreeEnvironment(1);
      let n = new DecisionNode();
    }catch(e){
      e.message.should.equal("ERROR: First parameter of DecisionNode should describe the assertion as a string.");
      return;
    }
    should.fail();
  });
  it('DecisionNodes must have a function for asserting the condition passed as second parameter.', function () {
    let e = new ent.DecisionTreeEnvironment(1);
    try{
      let n = new DecisionNode("Some assertion");
    }catch(e){
      e.message.should.equal("ERROR: Second parameter of DecisionNode should be a function which executes the assertion.");
      return;
    }
    should.fail();
  });
  it('If a decision node has no left , but right members of vice-versa will return an error', function () {
    let e = new ent.DecisionTreeEnvironment(1);
    let n1 = new DecisionNode("Some assertion 1", ()=>{ return true }); //This assertion will return true
    let n2 = new DecisionNode("Some assertion 2", ()=>{ return true }); //This assertion will return true
    e.addNode(n1);
    e.addNode(n2);
    try{
      e.processTree();
    } catch(e){
      e.message.should.equal("No node was defined as result, please add a decision node: Left: [object Object], Right: undefined");
    }
  });
  xit('DecisionNodes take a method to define which node to link to in case the assertion is true, and a decision event triggered each time there is a result', function (done) {
    let e = new ent.DecisionTreeEnvironment(1);
    let n1 = new DecisionNode("Some assertion 1", ()=>{ return true }); //This assertion will return true
    let n2 = new DecisionNode("Some assertion 2", ()=>{ return true }); //This assertion will return true
    let n3 = new DecisionNode("Some assertion 3", ()=>{ return true }); //This assertion will return true
    e.addNode(n1);
    e.addNode(n2);
    e.addNode(n3);
    n1.goToIfTrue(n2);
    n1.goToIfFalse(n3);
    e.on("decision", (result, node, path)=>{
      result.should.equal(true);
      node.should.be.eql(n2);
      done();
    });
    e.processTree();
  });
  it('DecisionNodes take a method to define which node to link to in case the assertion is false, and a decision event triggered each time there is a result', function (done) {
    let e = new ent.DecisionTreeEnvironment(1);
    let n1 = new DecisionNode("Some assertion 1", ()=>{ return false }); //This assertion will return false
    let n2 = new DecisionNode("Some assertion 2", ()=>{ return false }); //This assertion will return false
    let n3 = new DecisionNode("Some assertion 3", ()=>{ return true }); //This assertion will return true
    e.addNode(n1);
    e.addNode(n1);
    e.addNode(n3);
    n1.goToIfFalse(n2);
    n1.goToIfTrue(n3);
    e.on("decision", (result, node)=>{
      result.should.equal(false);
      node.should.be.eql(n2);
      done();
    });
    e.processTree();
  });
});

describe("When a Decision Tree environment is created via config", function() {
  xit('Should be able to run as a normal Environment / Detector / Notifier framework', function () {
    //Prepare
    //For the test to be done properly I need to require the file again, so that AddPlugin is run.
    delete require.cache[require.resolve('../main')];
    main = require('../main');
    motion = main._;

    let emptyConfig = new main._.Config("/test/config_empty_test.js");
    main._.StartWithConfig(emptyConfig, (e,d,n,f) =>{
    chai.request(main)
      .get('/config/detectors')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.equal(8);  //AddDetector, AddNotifier, RemoveNotifier, GetEnvironment + 2 for Activate/Deactivate Detectors, Get Detectors, Get Notifiers
        res.body[0]._isActive.should.equal(true);
        done();
      });
    });

    should.fail();
  });
});