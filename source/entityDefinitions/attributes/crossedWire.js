// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/wire.js

MachineEntityTypesAggregator.defineAttribute("crossedWire", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = null;
			internal.crosswiredDirections;
			
			// Behavior
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				var neighbors = internal.getNeighborsFrom(internal.crosswiredDirections);
				
				var shouldCross = neighbors.some(function(info) {
					var entity = info.entity;
					return entity.doesAcceptCrosswireFrom && entity.doesAcceptCrosswireFrom(info.direction);
				});
				
				internal.wiredDirections = shouldCross ? internal.crosswiredDirections : [];
			};
			
			// Power node
			exposed.doesAcceptCrosswireFrom = function() {
				return false; // [todo] make this work
			};
		};
	}];
});
