
var PhysicsConflict = SVP2.class(function(common) {

common.constructor = function(entityA, entityB, axis) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.entityA = entityA;
	internal.entityB = entityB;
	internal.axis = axis;
	
	// Exposed methods
	this.expose({
		entityA: false,
		entityB: false,
		axis: false
	});
	
	exposed.resolve = function() {
		var forceA = internal.entityA.velocities[internal.axis],
			forceB = internal.entityB.velocities[internal.axis];
		
		// Picking winner
		var aWins = forceA.type < forceB.type;
		
		var winnerEntity = aWins ? entityA : entityB,
			winnerForce = aWins ? forceA : forceB,
			loserEntity = aWins ? entityB : entityA,
			loserForce = aWins ? forceB : forceA;
		
		// Clamping loser force amount
		var direction = (winnerForce.amount != 0) ?
			(winnerForce.amount > 0 ? 1 : -1)
			: (loserForce.amount > 0 ? -1 : 1);
		
		var winnerProjection = winnerEntity.cell[internal.getAxisLetter()] + winnerForce.amount;
		
		loserForce.amount = winnerProjection - loserEntity.cell[internal.getAxisLetter()] + direction;
		
		// Changing loser force type
		loserForce.type = winnerForce.type;
	};
	
	// Internal methods
	internal.getAxisLetter = function() {
		return internal.axis ? "y" : "x";
	};
	
};

});