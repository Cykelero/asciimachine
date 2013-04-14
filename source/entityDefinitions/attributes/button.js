// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/broadcaster.js

MachineEntityTypesAggregator.defineAttribute("button", function(attr, types) {
	return [attr.broadcaster, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.getBroadcasts = function() {
				var triggered = internal.cell.getObjects().some(function(entity) {
					return entity.has("solid");
				});
				
				if (!triggered) {
					return [
						{
							cell: internal.cell.getInDirection(common.internal.direction),
							type: "inhibitPower"
						}
					];
				}
			};
		};
		
		common.internal.direction;
	}];
});
