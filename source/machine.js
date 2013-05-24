// needs +EntityFactory.js
// needs grid.js

var Machine = SVP2.class(function(common) {

common.constructor = function(worldText) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.grid = null;
	internal.entities = [];
	internal.managedAbstractions = [];
	
	internal.broadcasts = {};
	internal.previousBroadcasts = null;
	internal.fluidPressurePoints = null;
	
	internal.simulationFrame = 0;
	
	// Exposed methods
	exposed.tick = function() {
		internal.updatePhysics();
		internal.updateInstant();
		
		internal.simulationFrame++;
	}
	
	exposed.renderTo = function(renderer) {
		renderer.beginFrame(internal.grid.width, internal.grid.height);
		
		var effects = [];
		
		internal.entities.forEach(function(entity) {
			if (!entity.cell.isInsideGrid()) return;
			
			var entityColor = entity.getColor();
			if (entityColor.length < 4) entityColor = entityColor.concat([1]);
			
			var entityBGColor = entity.getBackgroundColor();
			if (entityBGColor.length < 4) entityBGColor = entityBGColor.concat([1]);
			
			renderer.drawObject({
				x: entity.cell.x,
				y: entity.cell.y,
				name: entity.getName(),
				char: entity.getChar(),
				color: entityColor,
				backgroundColor: entityBGColor,
				depth: entity.getDepth()
			});
			
			effects = effects.concat(entity.getEffects());
		});
		
		effects.forEach(function(effect) {
			renderer.drawEffect(effect);
		});
		
		renderer.flushFrame();
	}
	
	exposed.userAction = function(x, y) {
		var cell = internal.grid.getCell(x, y);
		if (cell) {
			cell.getObjects().forEach(function(entity) {
				entity.$userAction();
			});
		}
	};
	
	exposed.getCurrentFrame = function() {
		return internal.simulationFrame;
	};
	
	// // Entity management
	exposed.addEntity = function(entity) {
		entity.cell.addObject(entity);
		internal.entities.push(entity);
		return entity;
	};
	
	exposed.removeEntity = function(entity) {
		entity.cell.removeObject(entity);
		var entityIndex = internal.entities.indexOf(entity);
		if (entityIndex > -1) delete(internal.entities[entityIndex]);
		return entity;
	};
	
	exposed.getEntitiesWith = function(attributeName) {
		return internal.entities.filter(function(entity) {
			return entity.has(attributeName);
		});
	};
	
	// // Other entity calls
	exposed.getBroadcastsForCell = function(cell) {
		return internal.broadcasts[cell] || [];
	};
	
	exposed.getPreviousBroadcastsForCell = function(cell) {
		return internal.previousBroadcasts[cell] || [];
	};
	
	exposed.addManagedAbstraction = function(abstraction) {
		internal.managedAbstractions.push(abstraction);
	};
	
	exposed.removeManagedAbstraction = function(abstraction) {
		var abstractionIndex = internal.managedAbstractions.indexOf(abstraction);
		if (abstractionIndex > -1) delete(internal.managedAbstractions[abstractionIndex]);
		return abstraction;
	};
	
	exposed.addFluidPressurePoint = function(pressurePoint) {
		internal.fluidPressurePoints.push(pressurePoint);
	};
	
	// Internal methods
	internal.updateInstant = function() {
		// Managed abstractions
		internal.managedAbstractions.forEach(function(abstraction) {
			abstraction.$beginFrame();
		});
		
		// Generic entity behavior
		internal.previousBroadcasts = internal.broadcasts;
		internal.broadcasts = {};
		
		internal.entities.forEach(function(entity) {
			entity.$beginFrame();
		});
		
		internal.generateBroadcasts(false);

		exposed.getEntitiesWith("conductor").forEach(function(entity) {
			entity.$spreadPowerState();
		});

		exposed.getEntitiesWith("powerNode").forEach(function(entity) {
			entity.$initializePowerState();
		});
		
		// Power network
		var unstableCount = 0,
			previousUnstableCount;
		do {
			previousUnstableCount = unstableCount;
			unstableCount = exposed.getEntitiesWith("powerNode").reduce(function(count, entity) {
				return count + entity.$refreshOutputs();
			}, 0);
		} while (unstableCount != previousUnstableCount);
		
		internal.generateBroadcasts(true);
	}
	
	internal.updatePhysics = function() {
		// Apply fluid pressure
		// // Filter out obsolete pressure points
		var pressureOriginCells = [];
		
		internal.fluidPressurePoints = internal.fluidPressurePoints.filter(function(pressurePoint) {
			var pressuringEntityPresent = pressurePoint.from.getObjects().some(function(entity) {
				return entity.has("solid");
			});
			
			var pressuredFluid = internal.doesCellHave(pressurePoint.to, "fluid");
			
			if (pressuringEntityPresent && pressuredFluid) {
				pressureOriginCells.push(pressurePoint.from);
				return true;
			}
		});
		
		// // Move fluid around
		internal.fluidPressurePoints.forEach(function(pressurePoint) {
			var pressureCell = pressurePoint.to,
				pressuredFluid = internal.getCellEntity(pressureCell, "fluid");
			
			var wave = [pressureCell],
				traversedCells = [pressureCell];
			
			while (wave.length) {
				var cell = wave.shift();
				
				var leftFirst = Math.round(Math.random());
				var neighborDirections = [
					Direction.down,
					leftFirst ? Direction.left : Direction.right,
					leftFirst ? Direction.right : Direction.left,
					Direction.up
				];
				
				for (var d = 0 ; d < neighborDirections.length ; d++) {
					var neighborCell = cell.getInDirection(neighborDirections[d]);
					var isPressurePoint = (pressureOriginCells.indexOf(neighborCell) > -1);
					
					// Has cell been traversed already?
					if (traversedCells.indexOf(neighborCell) > -1) continue;
					
					// No and no: continue
					var hasFluid = internal.doesCellHave(neighborCell, "fluid"),
						hasSolid = neighborCell.getObjects().some(function(entity) {
							return pressuredFluid.doesCollideWith(entity);
						});
					
					if (hasFluid) {
						// Propagate
						wave.push(neighborCell);
						traversedCells.push(neighborCell);
					} else if (!hasSolid && !isPressurePoint) {
						// Free cell found
						if (pressurePoint.solid.has("fluid") && neighborCell.y <= pressurePoint.solid.cell.y) continue;
						
						// // Exit point found: Move the fluid entity
						pressuredFluid.moveTo(neighborCell);
						
						wave.length = 0;
						break;
					}
				};
			};
		});
		
		// Reset pressure points
		internal.fluidPressurePoints = [];
		
		// Generate forces
		exposed.getEntitiesWith("solid").forEach(function(entity) {
			entity.$generateForces();
		});
		
		exposed.getEntitiesWith("actuator").forEach(function(entity) {
			entity.$beginActuation();
		});
		
		// Resolve conflicts
		while (true) {
			var conflicts = [];
			
			// Find conflicts
			var entitiesWithSolid = exposed.getEntitiesWith("solid");
			for (var e = 0 ; e < entitiesWithSolid.length ; e++) {
				conflicts = conflicts.concat(entitiesWithSolid[e].$findConflicts());
				
				if (conflicts.length) break;
			};
			
			// Resolve conflicts
			if (conflicts.length) {
				conflicts[0].resolve();
			} else {
				break;
			}
		}
		
		// Apply forces
		exposed.getEntitiesWith("solid").forEach(function(entity) {
			entity.$applyComputedForces();
		});
		
		// Actuators (post-physics cleanup)
		exposed.getEntitiesWith("actuator").forEach(function(entity) {
			entity.$endActuation();
		});
	};
	
	internal.generateBroadcasts = function(afterPower) {
		exposed.getEntitiesWith("broadcaster").forEach(function(entity) {
			var broadcasts = entity.$getBroadcasts(afterPower);
			
			if (broadcasts) {
				broadcasts.forEach(function(broadcast) {
					var cell = broadcast.cell.toString();
					
					if (!(cell in internal.broadcasts)) internal.broadcasts[cell] = [];
					
					internal.broadcasts[cell].push(broadcast);
				});
			}
		});
	};
	
	internal.getCellEntity = function(cell, type) {
		var entities = cell.getObjects();
		for (var i = 0 ; i < entities.length ; i++) {
			var entity = entities[i];
			if (!type || entity.has(type)) return entity;
		}
		return null;
	};
	
	internal.doesCellHave = function(cell, type) {
		return (internal.getCellEntity(cell, type) != null);
	};
	
	// Init
	var lines = worldText.split("\n");
	
	// // Find world size
	var worldWidth = 0, worldHeight;
	for (var i = 0 ; i < lines.length ; i++) {
		worldWidth = Math.max(worldWidth, lines[i].length);
	}
	worldHeight = lines.length;
	
	// // Create grid
	internal.grid = new Grid(worldWidth, worldHeight, true);
	
	// // Generate entities
	var getOtherChar = function(x, y) {
		if (x < 0 || y < 0 || x >= internal.grid.width || y >= internal.grid.height) return null;
		return lines[y][x] || " ";
	};
	
	for (var y = 0 ; y < lines.length ; y++) {
		var line = lines[y];
		for (var x = 0 ; x < line.length ; x++) {
			var char = line[x],
				cell = internal.grid.getCell(x, y);
			
			if (char == " ") continue;
			exposed.addEntity(MachineEntityFactory.makeEntity(getOtherChar, self, char, cell));
		}
	}
	
	// // Initialize entity relationships
	internal.entities.forEach(function(entity) {
		entity.$initializeRelationships();
	});
	
	// // Start simulation
	internal.fluidPressurePoints = [];
	internal.updateInstant();
};

});

