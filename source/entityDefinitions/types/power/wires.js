// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType("-", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [Direction.right, Direction.left];
			
			// Init
			internal.parent.addEntity(new types.verticalCrossedWire(internal.parent, "", internal.cell));
		};
	}];
});

MachineEntityTypesAggregator.defineType("|", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [Direction.up, Direction.down];
			
			// Init
			internal.parent.addEntity(new types.horizontalCrossedWire(internal.parent, "", internal.cell));
		};
	}];
});

MachineEntityTypesAggregator.defineType("+", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
	}];
});