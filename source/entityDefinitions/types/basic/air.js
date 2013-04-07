// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType(" ", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
		
		common.internal.name = "air";
	}];
});
