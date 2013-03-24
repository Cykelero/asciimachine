// needs machineEntity.js
// needs powerState.js
// needs powerConnection.js
// needs direction.js

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
		
		internal.powerState = null;
		
		internal.poweredColor = [70, 190, 255];
		
		// Behavior
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			
			internal.powerState = new PowerState(self);
		};
		
		exposed.initializePowerState = function() {
			internal.initializeOutputs();
		};
		
		// Power node
		exposed.refreshOutputs = function() {
			internal.refreshPowerState();
			
			return internal.powerState.stable;
		};
		
		exposed.inputPower = function(connection) {
			var accept = internal.vetoIncomingConnection(connection);
			if (accept) internal.powerState.addInput(connection);
			return accept;
		};
		
		internal.initializeOutputs;
		
		internal.vetoIncomingConnection;
		
		internal.refreshPowerState;
		
		internal.proposeConnection = function(target, info) {
			var connection = new PowerConnection({
				from: self,
				to: target,
				info: info
			});
			
			var accepted = target.inputPower && target.inputPower(connection);
			if (accepted) {
				internal.powerState.addOutput(connection);
			}
			
			return accepted;
		};
		
		// Display
		internal.isPowered = function() {
			return internal.powerState.outputs.some(function(input) {
				return input.value;
			});
		};
		
		exposed.getColor = function() {
			return internal.isPowered() ? internal.poweredColor : parent.exposed.getColor();
		};
	};
}];

attr.conductor = [attr.powerNode, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.wiredDirections = Direction.all();
		
		internal.initializeOutputs = function() {
			internal.wiredDirections.forEach(function(direction) {
				internal.getNeighborsFrom([direction]).forEach(function(info) {
					internal.proposeConnection(info.entity, {direction: info.direction, kind: "contact"});
				});
			});
		};
		
		internal.vetoIncomingConnection = function(connection) {
			var info = connection.info;
			return info.kind == "contact"
				&& internal.wiredDirections.indexOf(Direction.flip(info.direction)) > -1;
		};
		
		internal.refreshPowerState = function() {
			var powered = internal.powerState.inputs.some(function(input) {
				return input.value;
			});
			
			if (powered) {
				internal.powerState.setAllOutputs(true);
				internal.powerState.stable = true;
			} else if (internal.powerState.getUnstableCount() == 0) {
				internal.powerState.stable = true;
			}
		};
	};
}];

attr.wire = [attr.conductor, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		exposed.doesAcceptCrosswireFrom = function(direction) {
			return internal.wiredDirections.indexOf(Direction.flip(direction)) > -1;
		};
	};
}];

attr.crossedWire = [attr.wire, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.wiredDirections = null;
		internal.crosswiredDirections;
		
		// Behavior
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			
			var neighbors = internal.getNeighborsFrom(internal.crosswiredDirections);
			
			var shouldCross = neighbors.some(function(info) {
				var entity = info.entity;
				return entity.doesAcceptCrosswireFrom && entity.doesAcceptCrosswireFrom(info.direction);
			});
			
			internal.wiredDirections = shouldCross ? internal.crosswiredDirections : [];
		};
		
		// Power node
		exposed.doesAcceptCrosswireFrom = function() {
			return false; // [todo] make this work
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
			
			internal.wiredDirections = [Direction.right, Direction.left];
			
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
			
			internal.wiredDirections = [Direction.up, Direction.down];
			
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
	"#": [attr.solid, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [50, 100, 170];
			internal.poweredColor = [100, 220, 255];
			
			internal.refreshPowerState = function() {
				internal.powerState.setAllOutputs(true);
				internal.powerState.stable = true;
			};
			
			internal.isPowered = function() {
				return true;
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
			
			// Behavior
			exposed.beginFrame = function() {
				parent.exposed.beginFrame();
				
				internal.wiredDirections = internal.enabled ? Direction.all() : [];
			};
			
			exposed.userAction = function() {
				internal.enabled = !internal.enabled;
			};
			
			// Rendering
			exposed.getBackgroundColor = function() {
				return internal.enabled ? [50, 170, 100] : [130, 10, 10];
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
			
			// Behavior
			exposed.initializeRelationships = function() {
				parent.exposed.initializeRelationships();
				
				internal.wiredDirections = Direction.all();
				
				internal.arrows.forEach(function(info) {
					var wireType = Direction.isVertical(info.direction) ? types["|"] : types["-"];
					
					internal.parent.addEntity(new wireType(internal.parent, "", info.entity.cell));
					
					var directionIndex = internal.wiredDirections.indexOf(info.direction);
					if (directionIndex > -1) internal.wiredDirections.splice(directionIndex, 1);
				});
			};
			
			// Power node
			internal.initializeOutputs = function() {
				internal.arrows.forEach(function(info) {
					var direction = info.direction;
					internal.getNeighborsFrom([direction]).forEach(function(info) {
						internal.proposeConnection(info.entity, {direction: info.direction, kind: "contact"});
					});
				});
			};
			
			internal.refreshPowerState = function() {
				var powerCount = internal.powerState.getPowerCount(),
					unstableCount = internal.powerState.getUnstableCount();
				
				if (unstableCount > 0) return;
				
				var outputsPower = (powerCount == 1);
				internal.powerState.setAllOutputs(outputsPower);
				internal.powerState.stable = true;
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
			
			internal.crosswiredDirections = [1, 3];
		};
	}],
	verticalCrossedWire: [attr.crossedWire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.crosswiredDirections = [0, 2];
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
