
var PowerConnection = SVP2.class(function(common) {

common.constructor = function(parameters) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.from = parameters.from;
	internal.to = parameters.to;
	internal.info = parameters.info;
	internal.value = null;
	
	// Exposed methods
	this.expose({
		from: false,
		to: false,
		info: false,
		value: true
	});	
};

});
