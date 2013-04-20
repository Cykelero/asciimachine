// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("gravity", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				if (!internal.cell.isInsideGrid()) {
					if ((common.internal.gravityAmount > 0) == (internal.cell.y > 0)) {
						// Exiting grid: removing
						internal.parent.removeEntity(self);
					}
				}
			};
			
			exposed.$generateForces = function() {
				parent.exposed.$generateForces();
				
				var amount = common.internal.gravityAmount;
				if (internal.isAffectedBy("reverseGravity")) amount = -amount;
				
				exposed.applyForce({
					axis: 1,
					amount: amount,
					type: "gravity_"+common.internal.weight
				});
			};
		};
		
		common.internal.gravityAmount = 1;
	}];
});
