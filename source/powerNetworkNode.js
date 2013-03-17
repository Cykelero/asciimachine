
var PowerNetworkNode = SVP2.class(function(common) {

this(function(network, parent) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.network = network;
	internal.parent = parent;
	
	internal.cachedPowerState = null;
	internal.cachedPowerStateStep = -1;
	
	// Exposed methods
	exposed.getPowerState = function(returnFinalOnly) {
		var currentStep = internal.network.getStep(),
			shouldIterate = returnFinalOnly && internal.cachedPowerStateStep < currentStep;
		
		if (internal.cachedPowerStateStep < currentStep) {
			internal.cachedPowerStateStep = currentStep;
			if (!internal.cachedPowerState) exposed.setPowerStateOff();
			
			internal.cachedPowerState = parent.computePowerState(internal.network);
		}
		
		if (shouldIterate) network.iterate();
		return internal.cachedPowerState;
	};
	
	exposed.setPowerStateOff = function() {
		internal.cachedPowerState = {
			state: [false, false, false, false]
		};
	};
	
	exposed.toString = function() {
		return internal.cachedPowerState.state.join();
	};
	
	// Internal methods
	
	// Init
	network.addNode(self);
	
});

// Exposed

// Internal

});
