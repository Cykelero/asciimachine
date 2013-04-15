// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("E", function(attr, types) {
	return [attr.fixed, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [220, 220, 220];
			internal.backgroundColor = [130, 130, 130];
		};
		
		common.internal.name = "conductor";
	}];
});
