// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/actuator.js

MachineEntityTypesAggregator.defineType("H", function(attr, types) {
	return [attr.fixed, attr.conductor, attr.actuator, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.arms = [];
			internal.bodySize = [1, 1];
			
			internal.backgroundColor = [140, 110, 100];
			
			// Behavior
			exposed.initializeRelationships = function() {
				parent.exposed.initializeRelationships();
				
				// Finding body width and height
				function countInDirection(direction) {
					var cell = internal.cell,
						count = 0;
					
					while (cell = cell.getInDirection(direction)) {
						var containsPistonBody = cell.getObjects().some(function(entity) {
							return entity.has("H");
						});
						
						if (containsPistonBody) {
							count++;
						} else {
							break;
						}
					};
					
					return count;
				};
				
				internal.bodySize[0] += countInDirection(Direction.up);
				internal.bodySize[0] += countInDirection(Direction.down);
				
				internal.bodySize[1] += countInDirection(Direction.right);
				internal.bodySize[1] += countInDirection(Direction.left);
				
				// Finding arms
				function findArmInDirection(direction) {
					var cell = internal.cell,
						pieces = [];
					
					while (cell = cell.getInDirection(direction)) {
						var piece = null;
						cell.getObjects().some(function(entity) {
							if (entity.has("arrow") && entity.getDirection() == direction) {
								piece = entity;
								return true;
							}
							
							if (entity.has("pipe") && entity.getAxis() == Direction.getAxis(direction)) {
								piece = entity;
								return true;
							}
						});
						
						if (piece) {
							pieces.push(piece);
							if (piece.has("arrow")) {
								break;
							}
						} else {
							break;
						}
					};
					
					if (!pieces.length || !pieces[pieces.length-1].has("arrow")) {
						pieces = null;
					}
					
					return pieces;
				};
				
				Direction.all().forEach(function(direction) {
					var entities = findArmInDirection(direction);
					if (entities) {
						var axis = +Direction.getAxis(direction),
							bodySize = internal.bodySize[axis];
						
						var arm = {
							entities: entities,
							direction: direction,
							axis: axis,
							
							retractedWhenResting: (entities.length == 1),
							minExposed: Math.max(1, entities.length - bodySize),
							maxExposed: bodySize+1
						};
						
						console.log(bodySize);
						
						internal.arms.push(arm);
					}
				});
			};
			
			// Actuator
			exposed.$beginActuation = function() {
				var powered = exposed.isPowered();
				
				internal.arms.forEach(function(arm) {
					var retracting = (arm.retractedWhenResting == !powered);
					
					if (retracting) {
						if (arm.entities.length > arm.minExposed) {
							var armBase = arm.entities.shift();
							internal.detachEntity(armBase);
							internal.parent.removeEntity(armBase);
						}
					} else {
						
					}
				});
			};
			
			exposed.$endActuation = function() {
				
			};
		};
	}];
});
