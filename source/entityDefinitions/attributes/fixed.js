// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("fixed", function(attr, types) {
	return [attr.solid, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [0, 0, 0];
			internal.backgroundColor = [255, 255, 255];
		};
			
		common.internal.inertiaType = common.internal.forceTypes.static;
	}];
});
