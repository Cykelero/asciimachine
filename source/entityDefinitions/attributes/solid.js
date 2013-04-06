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
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				internal.velocities = [null, null];
			};
			
			// Physics
			exposed.$generateForces = function() {};
			
			exposed.applyForce = function(parameters) {
				var axis = parameters.axis,
					amount = parameters.amount,
					type = parameters.type;
				
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
			
			//// conflict resolving
			
			exposed.$applyComputedForces = function() {
				var xSpeed = internal.velocities[0] && internal.velocities[0].amount || 0,
					ySpeed = internal.velocities[1] && internal.velocities[1].amount || 0;
				exposed.moveBy(xSpeed, ySpeed);
			};
		};
		
		common.internal.forceTypes = [
			"inertia_static",
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
		
		common.internal.weight = "normal";
	}];
});
