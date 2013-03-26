// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("solid", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.isSolid = true;
			
			internal.color = [0, 0, 0];
			internal.backgroundColor = [255, 255, 255];
		};
	}];
});
