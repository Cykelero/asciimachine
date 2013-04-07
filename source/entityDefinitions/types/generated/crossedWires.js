// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/crossedWire.js

MachineEntityTypesAggregator.defineType("horizontalCrossedWire", function(attr, types) {
	return [attr.crossedWire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.crosswiredDirections = [1, 3];
		};
		
		common.internal.name = "crossedWire-horizontal";
		
		common.internal.depth = common.internal.depths.background;
	}];
});

MachineEntityTypesAggregator.defineType("verticalCrossedWire", function(attr, types) {
	return [attr.crossedWire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.crosswiredDirections = [0, 2];
		};
		
		common.internal.name = "crossedWire-vertical";
		
		common.internal.depth = common.internal.depths.background;
	}];
});
