// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("actuator", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.$beginActuation;
			
			exposed.$endActuation;
		};
	}];
});
