// needs machineEntityTypesAggregator.js

// needs lineEffect.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/broadcaster.js
// needs entityDefinitions/attributes/hasArrows.js
// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("C", function(attr, types) {
	return [attr.fixed, attr.broadcaster, attr.hasArrows, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.poweredColor = [255, 180, 0];
			internal.backgroundColor = [150, 40, 40];
			
			internal.broadcasts = null;
			internal.laserEffects = null;
			internal.reachedCells = null;
			
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				internal.broadcasts = [];
				internal.laserEffects = [];
				internal.reachedCells = [];
				
				internal.arrows.forEach(function(info) {
					// Finding laser path
					var cell = internal.cell.getInDirection(info.direction, 2),
						direction = info.direction;
					
					// // Preparing line effect
					var effect = new LineEffect([255, 0, 0]);
					effect.addPoint(internal.findPoint(cell, Direction.flip(info.direction)));
					
					// // Finding path
					var previousDirection = direction;
					
					do {
						// Light redirection or blocking
						cell.getObjects().forEach(function(entity) {
							direction = entity.getLightDirection(direction);
						});
						
						// Blocked? Outside the grid?
						if (direction === null) break;
						if (!cell.isInsideGrid()) break;
						
						// All clear!
						internal.reachedCells.push(cell);
						
						// // Completing effect
						if (direction != previousDirection) {
							effect.addPoint({
								x: cell.x + .5,
								y: cell.y + .5
							});
						}
						
						effect.addPoint(internal.findPoint(cell, direction));
						
						// // Adding broadcast
						internal.broadcasts.push({
							cell: cell,
							type: "laser",
							data: {
								direction: previousDirection
							}
						});
						
						previousDirection = direction;
					} while (cell = cell.getInDirection(direction));
					
					// // Did the laser actually travel?
					if (effect.points.length > 0) {
						internal.laserEffects.push(effect);
					}
				});
			};
			
			internal.findPoint = function(cell, direction) {
				var axis = Direction.getAxis(direction),
					axisAmplitude = Direction.getAxisAmplitude(direction);
				
				var x, y;
				
				
				// X
				if (axis == 0) {
					x = axisAmplitude > 0 ? 1 : 0;
				} else {
					x = .5;
				}
				x += cell.x;
				
				// Y
				if (axis == 1) {
					y = axisAmplitude > 0 ? 1 : 0;
				} else {
					y = .5;
				}
				y += cell.y;
				
				return {
					x: x,
					y: y
				};
			};
			
			internal.initializeOutputs = function() {
				parent.internal.initializeOutputs();
				
				internal.reachedCells.forEach(function(cell) {
					cell.getObjects().forEach(function(entity) {
						internal.proposeConnection(entity, {kind: "laser"});
					});
				});
			};
			
			internal.getBroadcasts = function(afterPower) {
				if (!afterPower) return;
				
				if (exposed.isPowered()) return internal.broadcasts;
			};
			
			exposed.getEffects = function() {
				var effects = parent.exposed.getEffects();
				
				if (exposed.isPowered()) effects = effects.concat(internal.laserEffects);
				
				return effects;
			};
		};
		
		common.internal.name = "fan";
	}];
});
