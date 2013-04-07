// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/hasArrows.js

MachineEntityTypesAggregator.defineType("%", function(attr, types) {
	return [attr.fixed, attr.conductor, attr.hasArrows, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [100, 0, 170];
			
			// Behavior
			exposed.initializeRelationships = function() {
				parent.exposed.initializeRelationships();
				
				internal.wiredDirections = Direction.all();
				
				internal.arrows.forEach(function(info) {
					var wireType = Direction.isVertical(info.direction) ? types["|"] : types["-"];
					
					internal.parent.addEntity(new wireType(internal.parent, "", info.entity.cell));
					
					var directionIndex = internal.wiredDirections.indexOf(info.direction);
					if (directionIndex > -1) internal.wiredDirections.splice(directionIndex, 1);
				});
			};
			
			// Power node
			internal.initializeOutputs = function() {
				internal.arrows.forEach(function(info) {
					var direction = info.direction;
					internal.getNeighborsFrom([direction]).forEach(function(info) {
						internal.proposeConnection(info.entity, {direction: info.direction, kind: "contact"});
					});
				});
			};
			
			internal.refreshPowerState = function() {
				var powerCount = internal.powerState.getPowerCount(),
					unstableCount = internal.powerState.getUnstableCount();
				
				if (unstableCount > 0) return;
				
				var outputsPower = (powerCount == 1);
				internal.powerState.setAllOutputs(outputsPower);
			};
			
			exposed.sharePowerState = function() {
			};
			internal.spreadPowerState = function() {
			};
		};
	}];
});
