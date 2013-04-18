
var ConveyorGroup = SVP2.class(function(common) {

common.constructor = function() {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.forceSum = 0;
	
	internal.animationFrame = 0;
	
	// Exposed methods
	exposed.$beginFrame = function() {
		internal.animationFrame += exposed.getSpeed();
		
		internal.forceSum = 0;
	};
	
	exposed.drive = function(direction) {
		internal.forceSum += (direction ? 1 : -1);
	};
	
	exposed.getSpeed = function() {
		if (!internal.forceSum) return 0;
		
		return (internal.forceSum > 0) ? 1 : -1;
	};
	
	exposed.getAnimationFrame = function() {
		return internal.animationFrame + exposed.getSpeed();
	};
};

});
