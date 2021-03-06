// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/hasArrows.js
// needs entityDefinitions/attributes/broadcaster.js

MachineEntityTypesAggregator.defineAttribute("beamer", function(attr, types) {
	return [attr.hasArrows, attr.broadcaster, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.beamDirections = null;
			internal.usingArrowDirections = null;
			
			exposed.$initializeRelationships = function() {
				parent.exposed.$initializeRelationships();
				
				if (internal.arrows.length) {
					internal.beamDirections = internal.arrows.map(function(info) {
						return info.direction;
					});
					internal.usingArrowDirections = true;
				} else {
					internal.beamDirections = common.internal.defaultBeamDirections;
					internal.usingArrowDirections = false;
				}
			}
			
			internal.getBroadcasts = function(afterPower) {
				if (!afterPower) return;
				
				if (exposed.isPowered()) {
					var broadcasts = [];
					
					internal.beamDirections.forEach(function(direction) {
						var cell = internal.cell,
							distance = 0;
						
						if (internal.usingArrowDirections) {
							cell = cell.getInDirection(direction);
						}
						
						while (cell = cell.getInDirection(direction)) {
							if (!internal.doesBeamTraverse(cell, distance)) break;
							if (!cell.isInsideGrid()) break;
							
							var info = internal.getBroadcastInfo(direction);
							
							broadcasts.push({
								cell: cell,
								type: info.type,
								data: info.data
							});
							
							distance++;
						};
					});
					
					return broadcasts;
				}
			};
			
			internal.doesBeamTraverse;
			internal.getBroadcastInfo;
		};
		
		common.internal.defaultBeamDirections = [];
	}];
});
