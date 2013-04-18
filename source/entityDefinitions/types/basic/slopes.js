// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/sloped.js

MachineEntityTypesAggregator.defineType("/", function(attr, types) {
	return [attr.fixed, attr.sloped, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [130, 130, 130];
			internal.backgroundColor = [130, 130, 130, .6];
		};
		
		common.internal.name = "slope-up";
		
		common.internal.slopeDirections = [
			Direction.left,
			Direction.down,
			Direction.right,
			Direction.up
		];
	}];
});

MachineEntityTypesAggregator.defineType("\\", function(attr, types) {
	return [attr.fixed, attr.sloped, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [130, 130, 130];
			internal.backgroundColor = [130, 130, 130, .6];
		};
		
		common.internal.name = "slope-down";
		
		common.internal.slopeDirections = [
			Direction.right,
			Direction.up,
			Direction.left,
			Direction.down
		];
	}];
});
