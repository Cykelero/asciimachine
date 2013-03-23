
var PowerState = SVP2.class(function(common) {

common.constructor = function(powerNode) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.inputs = [];
	internal.outputs = [];
	
	internal.stable = false;
	
	// Exposed methods
	// // Get
	this.expose({
		inputs: false,
		outputs: false,
		stable: true
	});
	
	exposed.getPowerCount = function() {
		return internal.inputs.reduce(function(count, input) {
			return count + input.value;
		}, 0);
	};
	
	exposed.getUnstableCount = function() {
		return internal.inputs.reduce(function(count, input) {
			return count + (input.stable == false);
		}, 0);
	};
	
	// // Set
	exposed.addInput = function(connection) {
		internal.inputs.push(connection);
	};
	
	exposed.addOutput = function(connection) {
		internal.outputs.push(connection);
	};
	
	exposed.setAllOutputs = function(value) {
		internal.outputs.forEach(function(output) {
			output.value = value;
		});
	};

};

});
