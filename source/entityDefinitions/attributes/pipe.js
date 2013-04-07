// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js

MachineEntityTypesAggregator.defineAttribute("pipe", function(attr, types) {
	return [attr.fixed, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.getAxis = function() {
				return common.internal.axis;
			};
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [200, 160, 30];
		};
		
		common.internal.axis;
	}];
});
