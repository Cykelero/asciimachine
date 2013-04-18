// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/conveyorWheel.js

MachineEntityTypesAggregator.defineType("+", function(attr, types) {
	return [attr.conveyorWheel, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
		
		common.internal.name = "conveyorWheel-positive";
		
		common.internal.drivingPolarity = true;
		
		common.internal.startingAnimationFrame = 1;
	}];
});


MachineEntityTypesAggregator.defineType("x", function(attr, types) {
	return [attr.conveyorWheel, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
		
		common.internal.name = "conveyorWheel-negative";
		
		common.internal.drivingPolarity = false;
		
		common.internal.startingAnimationFrame = 0;
	}];
});
