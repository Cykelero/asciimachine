// needs machineEntity.js

var MachineEntityTypes = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

// // !Type attributes
var attr = exposed.attributes = {};

attr.solid = [function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.isSolid = true;
		
		internal.color = [0, 0, 0];
		internal.backgroundColor = [255, 255, 255];
	};
}];

attr.hasArrows = [function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.arrows = [];
		
		exposed.initializeRelationships = function() {
			parent.exposed.initializeRelationships();
			
			internal.getCloseNeighbors().forEach(function(info) {
				var entity = info.entity;
				if (entity.getChar() == common.internal.arrows[info.direction]) {
					internal.arrows.push(info);
				}
			});
		};
		
		common.internal.arrows = ["A", ">", "V", "<"];
	};
}];

attr.powerNode = [function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.isPowerNode = true;
		
		internal.powerNode = null;
		
		internal.poweredColor = [70, 190, 255];
		
		// Behavior
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
	};
}];

attr.conductor = [attr.powerNode, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.wiredDirections = [0, 1, 2, 3];
		internal.cachedWiredNeighbors = null;
		
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			internal.cachedWiredNeighbors = null;
		};
		
		exposed.computePowerState = function(network) {
			var powered = !!internal.getPowerCount(network);
			
			var state = [false, false, false, false];
			
			internal.wiredDirections.forEach(function(direction) {
				state[direction] = powered;
			});
			
			return {state: state};
		};
		
		internal.getPowerCount = function(network) {
			return internal.getCachedWiredNeighbors().reduce(function(count, info) {
				return count + 1*info.entity.getPowerState(network).state[(info.direction+2)%4];
			}, 0);
		};
		
		internal.getWiredNeighbors = function() {
			return internal.getNeighborsFrom(internal.wiredDirections);
		};
		
		internal.getCachedWiredNeighbors = function() {
			if (!internal.cachedWiredNeighbors) internal.cachedWiredNeighbors = internal.getWiredNeighbors();
			return internal.cachedWiredNeighbors;
		};
	};
}];

attr.wire = [attr.conductor, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
	};
}];

attr.crossedWire = [attr.wire, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.cachedShouldCross = null;
		
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			internal.cachedRemoteEntities = null;
		};
		
		exposed.computePowerState = function(network) {
			var shouldCross = false;
			
			if (internal.cachedShouldCross == null) {
				var neighbors = internal.getCachedWiredNeighbors();
				
				internal.cachedShouldCross = neighbors.some(function(info) {
					if (!info.entity) return;
					
					var expectedWireType = (info.direction%2 == 0) ? "|" : "-";
					
					return info.entity.getChar() == expectedWireType;
				});
			}
			
			if (internal.cachedShouldCross) {
				return parent.exposed.computePowerState(network);
			} else {
				return {state: [false, false, false, false]};
			}
		};
	};
}];

// // !Types
var types = exposed.types = {
	// Basic blocks
	"X": [attr.solid, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [130, 130, 130];
		};
	}],
	">": [attr.solid, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [100, 180, 100];
		};
	}],
	" ": [],
	
	// Power blocks
	// // Support
	"H": [attr.solid, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [140, 110, 100];
		};
	}],
	
	// // Wires
	"-": [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [1, 3];
			
			// Init
			internal.parent.addEntity(new types.verticalCrossedWire(internal.parent, "", internal.cell));
		};
	}],
	"|": [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [0, 2];
			
			// Init
			internal.parent.addEntity(new types.horizontalCrossedWire(internal.parent, "", internal.cell));
		};
	}],
	"+": [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
	}],
	
	// // Other
	"#": [attr.solid, attr.powerNode, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [50, 100, 170];
			internal.poweredColor = [100, 220, 255];
			
			exposed.computePowerState = function(network) {
				return {state: [true, true, true, true]};
			};
		};
	}],
	"@": [attr.solid, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.enabled = false;
			
			internal.poweredColor = [100, 255, 220];
			
			exposed.userAction = function() {
				internal.enabled = !internal.enabled;
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
		};
	}],
	"%": [attr.solid, attr.conductor, attr.hasArrows, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [100, 0, 170];
			
			exposed.initializeRelationships = function() {
				parent.exposed.initializeRelationships();
				
				internal.arrows.forEach(function(info) {
					internal.parent.addEntity(new types.H(internal.parent, "•", info.entity.cell)); // testtest!
					
					var directionIndex = internal.wiredDirections.indexOf(info.direction);
					if (directionIndex > -1) internal.wiredDirections.splice(directionIndex, 1);
				});
			};
			
			exposed.computePowerState = function(network) {
				var powerCount = internal.getPowerCount(network),
					outputsPower = (powerCount == 1);
				
				var state = [false, false, false, false];
				
				internal.arrows.forEach(function(info) {
					state[info.direction] = outputsPower;
				});
				
				return {state: state};
			};
		};
	}],
	
	// Generated
	horizontalCrossedWire: [attr.crossedWire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [1, 3];
		};
	}],
	verticalCrossedWire: [attr.crossedWire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [0, 2];
		};
	}]
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

// Init
for (var t in exposed.types) {
	if (exposed.types.hasOwnProperty(t)) {
		exposed.types[t] = internal.makeType(exposed.types[t]);
	}
};

});
