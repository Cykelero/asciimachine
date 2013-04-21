// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("broadcaster", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.$getBroadcasts = function(afterPower) {
				return internal.getBroadcasts(afterPower);
			};
			
			internal.getBroadcasts;
		};
	}];
});
