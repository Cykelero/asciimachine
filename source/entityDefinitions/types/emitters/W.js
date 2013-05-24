// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/broadcaster.js
// needs entityDefinitions/attributes/hasArrows.js
// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("W", function(attr, types) {
	return [attr.fixed, attr.broadcaster, attr.hasArrows, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [70, 70, 70];
			
			internal.getBroadcasts = function(afterPower) {
				if (!afterPower) return;
				
				if (exposed.isPowered()) {
					var broadcasts = [];
					
					Direction.all().forEach(function(direction) {
						broadcasts.push({
							cell: internal.cell.getInDirection(direction),
							type: "heat",
							data: {}
						});
					});
					
					return broadcasts;
				}
			};
		};
		
		common.internal.name = "heater";
	}];
});
