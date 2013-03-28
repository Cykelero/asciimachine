// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("solid", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.velocities = [null, null];
			
			// Behavior
			exposed.beginFrame = function() {
				parent.exposed.beginFrame();
				
				internal.velocities = [null, null];
			};
			
			// Physics
			exposed.applyForce = function(axis, amount, type) {
				var currentForce = internal.velocities[axis];
				var prevails = (currentForce == null)
					|| (type < currentForce.type);
				
				if (prevails) {
					// New forces replaces current one
					internal.velocities[axis] = {
						amount: amount,
						type: type
					};
				} else if (type == currentForce.type) {
					// New force adds to (or cancels) current one
					currentForce.amount += amount;
				}
			};
			
			exposed.emitForces = function() {};
			
			//// conflict resolving
			
			exposed.applyForces = function() {
				internal.moveBy(internal.velocities[0], internal.velocities[1]);
			};
		};
		
		common.internal.forceTypes = [
			"static",
			"magnetic_normal",
			"gravity_normal",
			"gravity_light",
			"friction_normal",
			"inertia_normal",
			"wind_light",
			"friction_light",
			"inertia_light"
		].reduce(function(map, item, index) {
			map[item] = index;
			return map;
		}, {});
		
		common.internal.inertiaType = common.internal.forceTypes.inertia_normal;
	}];
});
