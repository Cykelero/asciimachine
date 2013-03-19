
var PowerState = SVP2.class(function(common) {

common.constructor = function(defaultState) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	exposed.state = null;
	
	// Exposed methods
	// // Get
	exposed.get = function(direction) {
		return exposed.state[internal.toDirection(direction)];
	};
	
	exposed.getTop = function() {
		return exposed.get(0);
	};
	
	exposed.getRight = function() {
		return exposed.get(1);
	};
	
	exposed.getBottom = function() {
		return exposed.get(2);
	};
	
	exposed.getLeft = function() {
		return exposed.get(3);
	};
	
	exposed.any = function() {
		return exposed.state.some(function(directionState) {
			return directionState;
		});
	};
	
	// // Set
	exposed.set = function(direction, value) {
		exposed.state[internal.toDirection(direction)] = !!value;
	};
	
	exposed.setTop = function(value) {
		return exposed.set(0, value);
	};
	
	exposed.setRight = function(value) {
		return exposed.set(1, value);
	};
	
	exposed.setBottom = function(value) {
		return exposed.set(2, value);
	};
	
	exposed.setLeft = function(value) {
		return exposed.set(3, value);
	};
	
	// Internal methods
	internal.toDirection = function(direction) {
		return direction%4 || 0;
	};
	
	// Init
	defaultState = !!defaultState;
	exposed.state = [defaultState, defaultState, defaultState, defaultState];
};

// Exposed
common.exposed.makeFromDirections = function(directionList) {
	var state = new common.constructor();
	directionList.forEach(function(direction) {
		state.set(direction, true);
	});
	return state;
};

});
