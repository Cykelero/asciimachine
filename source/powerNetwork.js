// needs +Node.js

var PowerNetwork = SVP2.class(function(common) {

// Constants
common.internal.maximumIterations = 1000;

common.constructor = function() {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.step = 0;
	internal.nodes = [];
	
	// Exposed methods
	exposed.getStep = function() {
		return internal.step;
	};
	
	exposed.addNode = function(node) {
		internal.nodes.push(node);
	};
	
	exposed.makeNode = function(parent) {
		return new PowerNetworkNode(self, parent);
	};
	
	exposed.iterate = function() {
		var newGlobalSnapshot = internal.nodes.toString(),
			oldGlobalSnapshot;
		
		
		// Iterating
		console.log("--- power iteration ---");
		do {
			internal.step++;
			internal.nodes[0].getPowerState();
			
			oldGlobalSnapshot = newGlobalSnapshot;
			newGlobalSnapshot = internal.nodes.toString();
			
			console.log(newGlobalSnapshot);
		} while (oldGlobalSnapshot != newGlobalSnapshot && internal.step < common.internal.maximumIterations);
		
		if (internal.step >= common.internal.maximumIterations) {
			// Failed to stabilize network
			internal.nodes.forEach(function(node) {
				node.setPowerStateOff();
			});
		}
	};
	
};

// Exposed
common.exposed.makeNode = function(parent) {
	var network = new common.constructor();
	return new PowerNetworkNode(network, parent);
};

});
