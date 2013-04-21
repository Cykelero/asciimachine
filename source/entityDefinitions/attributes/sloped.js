// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("sloped", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.getLightDirection = function(direction) {
				return internal.getSlopeDirection(Direction.flip(direction));
			};
			
			exposed.$onWinConflict = function(loser, losingForce, newLoserForceAmount) {
				parent.exposed.$onWinConflict(loser, losingForce, newLoserForceAmount);
				
				var direction = Direction.getDirection(losingForce.axis, losingForce.amount);
				direction = Direction.flip(direction);
				
				var slopeDirection = internal.getSlopeDirection(direction);
				
				if (slopeDirection != direction) {
					loser.applyForce({
						axis: +Direction.getAxis(slopeDirection),
						amount: Math.abs(losingForce.amount) * Direction.getAxisAmplitude(slopeDirection),
						type: losingForce.type
					});
				}
			};
			
			internal.getSlopeDirection = function(direction) {
				return common.internal.slopeDirections[direction];
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
