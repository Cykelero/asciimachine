// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType("A", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.direction = 0;
	}];
});

MachineEntityTypesAggregator.defineType(">", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.direction = 1;
	}];
});

MachineEntityTypesAggregator.defineType("V", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.direction = 2;
	}];
});

MachineEntityTypesAggregator.defineType("<", function(attr, types) {
	return [attr.arrow, function(common) {
		common.internal.direction = 3;
	}];
});
