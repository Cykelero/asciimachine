// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType("X", function(attr, types) {
	return [attr.solid, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [130, 130, 130];
		};
	}];
});
