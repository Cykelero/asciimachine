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
				
				// Creating new internal.conveyorGroup if not already in one
				if (!internal.conveyorGroup) {
					internal.conveyorGroup = new ConveyorGroup();
					internal.polarity = true;
					
					internal.parent.addManagedAbstraction(internal.conveyorGroup);
				}
				
				// Finding belts
				Direction.all().forEach(function(direction) {
					var cell = internal.cell,
						pieces = [],
						isValidBelt = false;
					
					// Finding pieces
					while (cell = cell.getInDirection(direction)) {
						var piece = null;
						cell.getObjects().some(function(entity) {
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
						// Belt found: transmitting group and generating belt pieces
						// // Wheel: simply transmitting
						var endWheel = pieces.pop();
						endWheel.conveyorGroup = internal.conveyorGroup;
						endWheel.polarity = internal.polarity;
						
						// // Pipes: replacing
						pieces.forEach(function(pipe) {
							var beltPart = new types.conveyorBelt(internal.parent, pipe.getChar(), pipe.cell);
							internal.parent.addEntity(beltPart);
							internal.attachEntity(beltPart);
							internal.parent.removeEntity(pipe);
							
							beltPart.conveyorGroup = internal.conveyorGroup;
							beltPart.polarity = internal.polarity;
						});
					}
				});
			};
			
			exposed.$beginActuation = function() {
				if (exposed.isPowered()) {
					internal.conveyorGroup.drive(common.internal.drivingPolarity == internal.polarity);
				};
			};
			
			exposed.$endActuation = function() {
			}
		};
		
		common.internal.drivingPolarity;
	}];
});
