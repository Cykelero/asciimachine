
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
			return count + input;
		}, 0);
	};
	
	// // Set
	exposed.addInput = function(connection) {
		internal.inputs.push(connection);
	};
	
	exposed.addOutput = function(connection) {
		internal.outputs.push(connection);
	};
};

});
