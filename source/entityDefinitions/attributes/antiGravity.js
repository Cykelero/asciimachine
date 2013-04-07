// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/gravity.js

MachineEntityTypesAggregator.defineAttribute("antiGravity", function(attr, types) {
	return [attr.gravity, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
		
		common.internal.gravityAmount *= -1;
	}];
});
