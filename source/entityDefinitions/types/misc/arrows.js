// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/arrow.js

MachineEntityTypesAggregator.defineType("A", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.name = "arrow-up";
		
		common.internal.direction = 0;
	}];
});

MachineEntityTypesAggregator.defineType(">", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.name = "arrow-right";
		
		common.internal.direction = 1;
	}];
});

MachineEntityTypesAggregator.defineType("V", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.name = "arrow-down";
		
		common.internal.direction = 2;
	}];
});

MachineEntityTypesAggregator.defineType("<", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.name = "arrow-left";
		
		common.internal.direction = 3;
	}];
});
