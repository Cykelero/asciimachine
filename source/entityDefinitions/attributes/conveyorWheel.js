// needs machineEntityTypesAggregator.js

// needs conveyorGroup.js

// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/actuator.js
// needs entityDefinitions/attributes/conveyorPiece.js

MachineEntityTypesAggregator.defineAttribute("conveyorWheel", function(attr, types) {
	return [attr.conductor, attr.actuator, attr.conveyorPiece, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [60, 122, 63];
			
			exposed.$initializeRelationships = function() {
				parent.exposed.$initializeRelationships();
				
				// Create new internal.conveyorGroup if not already in one
				if (!internal.conveyorGroup) {
					internal.conveyorGroup = new ConveyorGroup();
					internal.polarity = true;
					
					internal.parent.addManagedAbstraction(internal.conveyorGroup);
				}
				
				// Find belts
				var searchForBelts = function(originCell, conveyorGroup, polarity) {
					Direction.all().forEach(function(direction) {
						var cell = originCell,
							pieces = [],
							isValidBelt = false;
						
						// Find pieces
						while (cell = cell.getInDirection(direction)) {
							var piece = null;
							cell.getObjects().some(function(entity) {
								if (entity.conveyorGroup != null) return;
								
								if (entity.has("conveyorWheel")) {
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
								if (piece.has("conveyorWheel")) {
									// Wheels end belts
									isValidBelt = true;
									break;
								}
							} else {
								break;
							}
						};
											
						if (isValidBelt) {
							// Belt found: transmit group and generate belt pieces
							// // Wheel: simply transmit
							var endWheel = pieces.pop();
							endWheel.conveyorGroup = conveyorGroup;
							endWheel.polarity = pieces.length ? polarity : !polarity;
							
							// // Pipes: replace
							pieces.forEach(function(pipe) {
								var beltPart = new types.conveyorBelt(internal.parent, pipe.getChar(), pipe.cell);
								internal.parent.addEntity(beltPart);
								internal.attachEntity(beltPart);
								internal.parent.removeEntity(pipe);
								
								beltPart.conveyorGroup = conveyorGroup;
								beltPart.polarity = polarity;
							});
							
							// // Then, transmit further from the wheel
							searchForBelts(endWheel.cell, conveyorGroup, endWheel.polarity);
						}
					});
				};
				
				searchForBelts(internal.cell, internal.conveyorGroup, internal.polarity);
			};
			
			exposed.$beginActuation = function() {
				if (exposed.isPowered()) {
					internal.conveyorGroup.drive(common.internal.drivingPolarity == internal.polarity);
				};
			};
			
			exposed.$endActuation = function() {
			}
			
			// Display
			exposed.getChar = function() {
				var frameCount = common.internal.animationFrames.length,
					animationFrame = ((internal.conveyorGroup.getAnimationFrame() + common.internal.startingAnimationFrame) % frameCount + frameCount) % frameCount;
				
				return common.internal.animationFrames[animationFrame];
			};
		};
		
		common.internal.drivingPolarity;
		
		common.internal.animationFrames = ["x", "+"];
		common.internal.startingAnimationFrame;
	}];
});
