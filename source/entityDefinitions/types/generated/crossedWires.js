// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType("horizontalCrossedWire", function(attr, types) {
	return [attr.crossedWire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.crosswiredDirections = [1, 3];
		};
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
	}];
});
