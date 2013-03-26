// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType("A", function(attr, types) {
	return [attr.arrow, function() {}];
});

MachineEntityTypesAggregator.defineType(">", function(attr, types) {
	return [attr.arrow, function() {}];
});

MachineEntityTypesAggregator.defineType("V", function(attr, types) {
	return [attr.arrow, function() {}];
});

MachineEntityTypesAggregator.defineType("<", function(attr, types) {
	return [attr.arrow, function() {}];
});
