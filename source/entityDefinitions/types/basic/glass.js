// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js

MachineEntityTypesAggregator.defineType("S", function(attr, types) {
	return [attr.fixed, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [55, 110, 160];
	
			exposed.getLightDirection = function(direction) {
				return direction;
			};
		};
		
		common.internal.name = "glass";
	}];
});
