// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("hasArrows", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.arrows = [];
			
			exposed.initializeRelationships = function() {
				parent.exposed.initializeRelationships();
				
				internal.getCloseNeighbors().forEach(function(info) {
					var entity = info.entity;
					if (entity.has("arrow") && entity.getDirection() == info.direction) {
						internal.arrows.push(info);
						internal.attachedEntities.push(info.entity);
					}
				});
			};
		};
	}];
});
