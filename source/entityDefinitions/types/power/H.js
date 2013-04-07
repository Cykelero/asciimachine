// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("H", function(attr, types) {
	return [attr.fixed, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [140, 110, 100];
		};
	}];
});
