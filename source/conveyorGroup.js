
var ConveyorGroup = SVP2.class(function(common) {

common.constructor = function() {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.forceSum = null;
	
	// Exposed methods
	exposed.$beginFrame = function() {
		internal.forceSum = 0;
	};
	
	exposed.drive = function(direction) {
		internal.forceSum += (direction ? 1 : -1);
	};
	
	exposed.getSpeed = function() {
		if (!internal.forceSum) return 0;
		
		return (internal.forceSum > 0) ? 1 : -1;
	};
};

});
