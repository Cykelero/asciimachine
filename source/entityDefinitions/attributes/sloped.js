// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("sloped", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.$onWinConflict = function(loser, losingForce) {
				parent.exposed.$onWinConflict(loser, losingForce);
				
				var direction = Direction.getDirection(losingForce.axis, losingForce.amount);
				direction = Direction.flip(direction);
				
				var slopeDirection = common.internal.slopeDirections[direction];
				
				if (slopeDirection != direction) {
					loser.applyForce({
						axis: +Direction.getAxis(slopeDirection),
						amount: Math.abs(losingForce.amount) * Direction.getAxisAmplitude(slopeDirection),
						type: losingForce.type
					});
				}
			};
		};
		
		common.internal.slopeDirections = [
			Direction.up,
			Direction.right,
			Direction.down,
			Direction.left
		];
	}];
});
