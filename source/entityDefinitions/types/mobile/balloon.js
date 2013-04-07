// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/solid.js
// needs entityDefinitions/attributes/antiGravity.js

MachineEntityTypesAggregator.defineType("0", function(attr, types) {
	return [attr.solid, attr.antiGravity, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [200, 0, 200];
		};
		
		common.internal.name = "balloon";
		
		common.internal.weight = "light";
	}];
});
