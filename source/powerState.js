// needs direction.js

var PowerState = SVP2.class(function(common) {

common.constructor = function(defaultState) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	exposed.state = null;
	
	// Exposed methods
	// // Get
	exposed.get = function(direction) {
		return exposed.state[Direction(direction)];
	};
	
	exposed.getTop = function() {
		return exposed.get(Direction.up);
	};
	
	exposed.getRight = function() {
		return exposed.get(Direction.right);
	};
	
	exposed.getBottom = function() {
		return exposed.get(Direction.down);
	};
	
	exposed.getLeft = function() {
		return exposed.get(Direction.left);
	};
	
	exposed.any = function() {
		return exposed.state.some(function(directionState) {
			return directionState;
		});
	};
	
	// // Set
	exposed.set = function(direction, value) {
		exposed.state[Direction(direction)] = !!value;
	};
	
	exposed.setTop = function(value) {
		return exposed.set(Direction.up, value);
	};
	
	exposed.setRight = function(value) {
		return exposed.set(Direction.right, value);
	};
	
	exposed.setBottom = function(value) {
		return exposed.set(Direction.down, value);
	};
	
	exposed.setLeft = function(value) {
		return exposed.set(Direction.left, value);
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
