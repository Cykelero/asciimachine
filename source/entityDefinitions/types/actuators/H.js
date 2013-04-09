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
							return entity.getName() == exposed.getName();
						});
						
						if (containsPistonBody) {
							count++;
						} else {
							break;
						}
					};
					
					return count;
				};
				
				internal.bodySize[0] += countInDirection(Direction.right);
				internal.bodySize[0] += countInDirection(Direction.left);
				
				internal.bodySize[1] += countInDirection(Direction.up);
				internal.bodySize[1] += countInDirection(Direction.down);
				
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
							maxExposed: Math.max(bodySize+1, entities.length),
							
							isRetracting: null,
							isMoving: null
						};
						
						internal.arms.push(arm);
					}
				});
			};
			
			// Actuator
			exposed.$beginActuation = function() {
				var powered = exposed.isPowered();
				
				internal.arms.forEach(function(arm) {
					arm.isRetracting = (arm.retractedWhenResting == !powered);
					
					// Retracting?
					if (arm.isRetracting) {
						arm.isMoving = (arm.entities.length > arm.minExposed);
						if (arm.isMoving) {
							// Retracting: Removing the first entity
							var armBase = arm.entities.shift();
							internal.detachEntity(armBase);
							internal.parent.removeEntity(armBase);
						}
					} else {
						arm.isMoving = (arm.entities.length < arm.maxExposed);
					}
					
					// Pushing entities
					if (arm.isMoving) {
						var amplitudeOnAxis = Direction.getAxisAmplitude(arm.direction);
						if (arm.isRetracting) amplitudeOnAxis = -amplitudeOnAxis;
						
						arm.entities.forEach(function(entity) {
							entity.imposeForce({
								axis: arm.axis,
								amount: amplitudeOnAxis,
								type: common.internal.forceTypes["actuation_static"]
							});
						});
					}
				});
			};
			
			exposed.$endActuation = function() {
				internal.arms.forEach(function(arm) {
					if (!arm.isRetracting && arm.isMoving) {
						if (arm.entities[0].velocities[arm.axis].amount != 0) {
							// Arm successfully extending: adding new piece
							var pieceType = arm.axis ? "I" : "=";
							
							var newPiece = new types[pieceType](internal.parent, pieceType, internal.cell.getInDirection(arm.direction));
							
							arm.entities.unshift(newPiece);
							internal.attachEntity(newPiece);
							internal.parent.addEntity(newPiece);
						}
					}
				});
			};
		};
		
		common.internal.name = "piston";
	}];
});
