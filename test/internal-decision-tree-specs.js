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
let DecisionNode = require("../DecisionNode").DecisionNode;

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
    (e instanceof t.Entities.Environment).should.equal(true);
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
      e.message.should.equal("ERROR: Parameter of 'addNode' method must be of instance DecisionNode.");
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
  it('DecisionNodes take a method to define which node to link to in case the assertion is true', function () {
    let e = new ent.DecisionTreeEnvironment(1);
    let n = new DecisionNode("Some assertion", ()=>{ return true });
    n.goToIfTrue(); // Use promises instead?
    should.fail();
  });
  it('DecisionNodes take a method to define which node to link to in case the assertion is false', function () {
    let e = new ent.DecisionTreeEnvironment(1);
    let n = new DecisionNode("Some assertion", ()=>{ return true });
    n.goToIfFalse(); // Use promises instead?
    should.fail();
  });
});



