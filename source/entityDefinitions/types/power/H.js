// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("H", function(attr, types) {
	return [attr.fixed, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.arms = [];
			internal.bodySize = {
				width: 1,
				height: 1
			};
			
			internal.backgroundColor = [140, 110, 100];
			
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
				};
				
				internal.bodySize.width += countInDirection(Direction.right);
				internal.bodySize.width += countInDirection(Direction.left);
				
				internal.bodySize.height += countInDirection(Direction.up);
				internal.bodySize.height += countInDirection(Direction.down);
				
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
				
				internal.arms = [
					findArmInDirection(0),
					findArmInDirection(1),
					findArmInDirection(2),
					findArmInDirection(3)
				];
			};
		};
	}];
});
