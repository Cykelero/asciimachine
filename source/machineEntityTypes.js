// needs machineEntity.js
// needs powerState.js

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
		exposed.getPowerState = function(network) {
			var needFinalValue = !network;
			
			// Power node generation
			if (!internal.powerNode) {
				if (!network) network = new PowerNetwork();
				internal.powerNode = network.makeNode(self);
			}
			
			return internal.powerNode.getPowerState(needFinalValue);
		};
		
		// // Power network-requested calculations
		exposed.computePowerState = function() {
			return new PowerState();
		};
		
		internal.getPowerCountFrom = function(directions) {
			var inputEntities = internal.getNeighborsFrom(directions);
			return inputEntities.reduce(function(count, info) {
				var flippedDirection = (info.direction+2)%4,
					neighborPowerState = info.entity.getPowerState(internal.getNetwork());
				
				return count + neighborPowerState.get(flippedDirection);
			}, 0);
		};
		
		internal.getNetwork = function() {
			return internal.powerNode.network;
		};
		
		// Display
		internal.isPowered = function() {
			return exposed.getPowerState().any();
		};
		
		exposed.getColor = function() {
			return internal.isPowered() ?
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
		
		exposed.computePowerState = function() {
			var powered = !!internal.getPowerCountFrom(internal.wiredDirections);
			
			if (powered) {
				return PowerState.makeFromDirections(internal.wiredDirections);
			} else {
				return new PowerState();
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
		
	};
}];

attr.crossedWire = [attr.wire, function(common) {
	common.constructor = function() {
		var exposed = this.exposed,
			internal = this.internal,
			parent = this.parent,
			self = exposed;
		
		internal.cachedShouldCross = null;
		
		// Behavior
		exposed.beginFrame = function() {
			parent.exposed.beginFrame();
			internal.cachedShouldCross = null;
		};
		
		// Power node handling
		exposed.computePowerState = function() {
			var shouldCross = false;
			
			if (internal.cachedShouldCross == null) {
				var neighbors = internal.getNeighborsFrom(internal.wiredDirections);
				
				internal.cachedShouldCross = neighbors.some(function(info) {
					var expectedWireType = (info.direction%2 == 0) ? "|" : "-";
					
					return info.entity.getChar() == expectedWireType;
				});
			}
			
			if (internal.cachedShouldCross) {
				return parent.exposed.computePowerState();
			} else {
				return new PowerState();
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
			
			exposed.computePowerState = function() {
				return new PowerState(true);
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
			
			exposed.computePowerState = function() {
				if (internal.enabled) {
					return parent.exposed.computePowerState();
				} else {
					return new PowerState();
				}
			};
			
			exposed.getBackgroundColor = function() {
				return internal.enabled ?
					[50, 170, 100]
					: [130, 10, 10];
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
			
			exposed.computePowerState = function() {
				var powerCount = internal.getPowerCountFrom(internal.wiredDirections),
					outputsPower = (powerCount == 1);
				
				var state = new PowerState();
				if (outputsPower) {
					internal.arrows.forEach(function(info) {
						state.set(info.direction, true);
					});
				}
				
				return state;
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
