// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/pipe.js

MachineEntityTypesAggregator.defineType("=", function(attr, types) {
	return [attr.pipe, function(common) {
		common.internal.name = "pipe-horizontal";
		
		common.internal.axis = false;
	}];
});

MachineEntityTypesAggregator.defineType("I", function(attr, types) {
	return [attr.pipe, function(common) {
		common.internal.name = "pipe-vertical";
		
		common.internal.axis = true;
	}];
});
