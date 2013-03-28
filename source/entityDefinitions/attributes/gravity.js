// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("gravity", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.$generateForces = function() {
				parent.exposed.$generateForces();
				
				exposed.applyForce({
					axis: 1,
					amount: common.internal.gravityAmount,
					type: common.internal.forceTypes["gravity_"+common.internal.weight]
				});
			};
		};
		
		common.internal.gravityAmount = 1;
	}];
});
