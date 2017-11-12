/**
 * DecisionNode is a Node inside the DecisionTreeEnvironment class
});
 */
class DecisionNode{
  
  constructor(descriptor, fn){
  	if(!descriptor){
  	  throw new Error("ERROR: First parameter of DecisionNode should describe the assertion as a string.");
  	}
  	if(typeof(fn) != "function"){
  	  throw new Error("ERROR: Second parameter of DecisionNode should be a function which executes the assertion.");
  	}

  	this.descriptor = descriptor;
  }
}

exports.DecisionNode = DecisionNode;