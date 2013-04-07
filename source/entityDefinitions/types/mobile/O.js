// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/solid.js
// needs entityDefinitions/attributes/gravity.js

MachineEntityTypesAggregator.defineType("O", function(attr, types) {
	return [attr.solid, attr.gravity, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [220, 140, 0];
		};
	}];
});
