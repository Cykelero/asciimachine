// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/sloped.js

MachineEntityTypesAggregator.defineAttribute("conveyorPiece", function(attr, types) {
	return [attr.fixed, attr.sloped, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.conveyorGroup = null;
			internal.polarity = null;
			
			this.expose({
				conveyorGroup: true,
				polarity: true
			});
			
			exposed.getLightDirection = function(direction) {
				return null;
			};
			
			internal.getSlopeDirection = function(direction) {
				var conveyorSpeed = internal.conveyorGroup.getSpeed();
				if (!internal.polarity) conveyorSpeed = -conveyorSpeed;
				
				var slopeDirections;
				switch (conveyorSpeed) {
					case 0:
						slopeDirections = common.internal.slopeDirections;
						break;
					case 1:
						slopeDirections = common.internal.positiveSlopeDirections;
						break;
					case -1:
						slopeDirections = common.internal.negativeSlopeDirections;
						break;
				}
				
				return slopeDirections[direction];
			};
		};
		
		common.internal.positiveSlopeDirections = [
			Direction.right,
			Direction.down,
			Direction.left,
			Direction.up
		];
		
		common.internal.negativeSlopeDirections = [
			Direction.left,
			Direction.up,
			Direction.right,
			Direction.down
		];
	}];
});
