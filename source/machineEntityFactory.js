// needs machineEntity.js
// needs powerNetwork.js

var MachineEntityFactory = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

exposed.makeEntity = function(getOtherChar, char, cell) {
	var entityClass,
		entity;
	
	// Choosing class
	if (false && someSpecialCase) {
		
	} else {
		entityClass = internal.types[char];
	}
	
	// Creating entity
	if (entityClass) {
		entity = new entityClass(char, cell);
	} else {
		throw(new Error("Unknown entity type: "+char));
	}
	
	return entity;
};

// Internal
var internal = common.internal;

internal.makeType = function(mixin) {
	var defines = [];
	var addToDefines = function(define) {
		if (typeof(define) == "function") {
			if (defines.indexOf(define) == -1) defines.push(define);
		} else {
			define.forEach(function(subDefine) {
				addToDefines(subDefine);
			});
		}
	};
	addToDefines(mixin);
	
	return SVP2.mixin(MachineEntity, defines);
};

// // Type attributes
var attr = internal.attributes = {};

attr.solid = [function(common) {
	this(function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.isSolid = true;
		
		internal.color = [0, 0, 0];
		internal.backgroundColor = [255, 255, 255];
	});
}];

attr.powerNode = [function(common) {
	this(function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.isPowerNode = true;
		
		internal.powerNode = null;
		
		internal.poweredColor = [70, 190, 255];
		
		// Exposed methods
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			
			internal.powerNode = null;
		};
		
		exposed.tick = function() {
			parent.exposed.tick();
			
			exposed.getPowerState();
		};
		
		// Power node handling
		internal.getPowerNode = function(network) {
			if (!internal.powerNode) {
				if (!network) {
					internal.powerNode = PowerNetwork.makeNode(self);
				} else {
					internal.powerNode = network.makeNode(self);
				}
			}
			return internal.powerNode;
		};
		
		exposed.getPowerState = function(network) {
			return internal.getPowerNode(network).getPowerState(!network);
		};
		
		exposed.computePowerState = function(network) { // called by the powerNode
			return false;
		};
		
		// Display
		exposed.getColor = function() {
			return exposed.getPowerState().state.some(function(state) {return state}) ?
				internal.poweredColor
				: parent.exposed.getColor();
		};
	});
}];

attr.conductor = [attr.powerNode, function(common) {
	this(function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.cachedWiredNeighbors = null;
		
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			internal.cachedWiredNeighbors = null;
		};
		
		exposed.computePowerState = function(network) {
			var powered = internal.getCachedWiredNeighbors().some(function(info) {
				return info.entity.getPowerState(network).state[(info.direction+2)%4];
			});
			
			return {state: [powered, powered, powered, powered]};
		};
		
		internal.getWiredNeighbors = function() {
			return internal.getCloseNeighbors();
		};
		
		internal.getCachedWiredNeighbors = function() {
			if (!internal.cachedWiredNeighbors) internal.cachedWiredNeighbors = internal.getWiredNeighbors();
			return internal.cachedWiredNeighbors;
		};
	});
}];

attr.wire = [attr.conductor, function(common) {
	this(function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
	});
}];

// // Types
internal.types = {
	// Basic blocks
	"X": [attr.solid, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [130, 130, 130];
		});
	}],
	" ": [],
	
	// Power blocks
	// // Support
	"H": [attr.solid, attr.conductor, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [140, 110, 100];
		});
	}],
	
	// // Wires
	"-": [attr.wire, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
		
			internal.getWiredNeighbors = function() {
				return internal.getNeighborsFrom([1, 3]);
			};
		});
	}],
	"|": [attr.wire, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
		
			internal.getWiredNeighbors = function() {
				return internal.getNeighborsFrom([0, 2]);
			};
		});
	}],
	"+": [attr.wire, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		});
	}],
	
	// // Other
	"#": [attr.solid, attr.powerNode, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [50, 100, 170];
			internal.poweredColor = [100, 220, 255];
			
			exposed.computePowerState = function(network) {
				return {state: [true, true, true, true]};
			};
		});
	}],
	"@": [attr.solid, attr.conductor, function(common) {
		this(function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.enabled = false;
			
			internal.color = [0, 0, 0];
			internal.poweredColor = [100, 255, 220];
			
			exposed.userAction = function() {
				internal.enabled = !internal.enabled;
				console.log(internal.enabled);
			};
			
			exposed.getBackgroundColor = function() {
				return internal.enabled ?
					[50, 170, 100]
					: [130, 10, 10];
			};
			
			exposed.computePowerState = function(network) {
				if (internal.enabled) {
					return parent.exposed.computePowerState(network);
				} else {
					return {state: [false, false, false, false]};
				}
			};
		});
	}]
};

for (var t in internal.types) {
	if (internal.types.hasOwnProperty(t)) {
		internal.types[t] = internal.makeType(internal.types[t]);
	}
};

});
