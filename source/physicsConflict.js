
var PhysicsConflict = SVP2.class(function(common) {

common.constructor = function(entityA, entityB, axis, priority) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.entityA = entityA;
	internal.entityB = entityB;
	internal.axis = axis;
	
	internal.priority = (priority !== undefined) ? priority : Number.POSITIVE_INFINITY;
	
	// Exposed methods
	this.expose({
		entityA: false,
		entityB: false,
		axis: false
	});
	
	exposed.resolve = function(preventDelegation) {
		var forceA = internal.entityA.velocities[internal.axis],
			forceB = internal.entityB.velocities[internal.axis];
		
		// Pick winner
		var aWins = forceA.type < forceB.type;
		
		var winnerEntity = aWins ? entityA : entityB,
			winnerForce = aWins ? forceA : forceB,
			loserEntity = aWins ? entityB : entityA,
			loserForce = aWins ? forceB : forceA;
		
		// Delegate resolution?
		if (!preventDelegation) {
			// Loser first
			if (loserEntity == internal.entityB) {
				var conflict = loserEntity.findConflictWith(winnerEntity);
				if (conflict) {
					conflict.resolve(true);
					return;
				};
			}
			
			// If no loser speed: alternate resolution
			if (loserEntity == entityB && loserForce.amount == 0 && loserEntity.velocities[1-internal.axis] != 0) {
				var conflict = loserEntity.findConflictWith(winnerEntity);
				if (conflict) {
					conflict.resolve(true);
					return;
				};
			}
		}
		
		// Didn't delegate: Compute loser force amount clamping
		var direction = (winnerForce.amount != 0) ?
			(winnerForce.amount > 0 ? 1 : -1)
			: (loserForce.amount > 0 ? -1 : 1);
		
		var winnerProjection = winnerEntity.cell[internal.getAxisLetter()] + winnerForce.amount,
			newLoserForceAmount = winnerProjection - loserEntity.cell[internal.getAxisLetter()] + direction;
		
		// Call onWin callback
		var vetoValue = winnerEntity.$onWinConflict(loserEntity, loserForce, newLoserForceAmount);
		
		if (vetoValue != undefined && !vetoValue) return; // $onWinConflict can prevent resolution
		
		// Apply changes to loser force
		loserForce.type = winnerForce.type;
		loserForce.amount = newLoserForceAmount;
		
	};
	
	exposed.getPriority = function() {
		return internal.priority;
	};
	
	exposed.getStrongestForceType = function() {
		var forceTypeA = internal.entityA.velocities[internal.axis].type,
			forceTypeB = internal.entityB.velocities[internal.axis].type;
		
		return Math.min(forceTypeA, forceTypeB);
	};
	
	exposed.getForceTypeTotal = function() {
		var forceTypeA = internal.entityA.velocities[internal.axis].type,
			forceTypeB = internal.entityB.velocities[internal.axis].type;
		
		return forceTypeA + forceTypeB;
	};
	
	// Internal methods
	internal.getAxisLetter = function() {
		return internal.axis ? "y" : "x";
	};
	
};

});
