// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/button.js

MachineEntityTypesAggregator.defineType("¨", function(attr, types) {
	return [attr.button, function(common) {
		common.internal.name = "button-up";
		
		common.internal.depth = common.internal.depths.background;
		
		common.internal.direction = 0;
	}];
});

MachineEntityTypesAggregator.defineType("[", function(attr, types) {
	return [attr.button, function(common) {
		common.internal.name = "button-right";
		
		common.internal.depth = common.internal.depths.background;
		
		common.internal.direction = 1;
	}];
});

MachineEntityTypesAggregator.defineType("_", function(attr, types) {
	return [attr.button, function(common) {
		common.internal.name = "button-down";
		
		common.internal.depth = common.internal.depths.background;
		
		common.internal.direction = 2;
	}];
});

MachineEntityTypesAggregator.defineType("]", function(attr, types) {
	return [attr.button, function(common) {
		common.internal.name = "button-left";
		
		common.internal.depth = common.internal.depths.background;
		
		common.internal.direction = 3;
	}];
});
