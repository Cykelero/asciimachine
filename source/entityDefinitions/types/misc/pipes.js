// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/pipe.js

MachineEntityTypesAggregator.defineType("I", function(attr, types) {
	return [attr.pipe, function(common) {
		common.internal.axis = 0;
	}];
});

MachineEntityTypesAggregator.defineType("=", function(attr, types) {
	return [attr.pipe, function(common) {
		common.internal.axis = 1;
	}];
});
