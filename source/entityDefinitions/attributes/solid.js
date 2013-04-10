// needs machineEntityTypesAggregator.js
// needs physicsConflict.js

MachineEntityTypesAggregator.defineAttribute("solid", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.velocities = [null, null];
			
			// Behavior
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				var inertiaType = common.internal.forceTypes["inertia_" + common.internal.weight];
				exposed.velocities = [
					{amount: 0, type: inertiaType},
					{amount: 0, type: inertiaType}
				];
			};
			
			// Physics
			// // Acting
			exposed.$generateForces = function() {};
			
			exposed.applyForce = function(parameters) {
				var axis = parameters.axis,
					amount = parameters.amount,
					type = parameters.type;
				
				var currentForce = exposed.velocities[axis];
				var prevails = (type < currentForce.type);
				
				if (prevails) {
					// New forces replaces current one
					exposed.velocities[axis] = {
						amount: amount,
						type: type
					};
				} else if (type == currentForce.type) {
					// New force adds to (or cancels) current one
					//currentForce.amount += amount;
				}
			};
			
			exposed.imposeForce = function(forceParameters) {
				var currentForce = exposed.velocities[forceParameters.axis];
				currentForce.type = Number.POSITIVE_INFINITY;
				
				exposed.applyForce(forceParameters);
			};
			
			exposed.$applyComputedForces = function() {
				var xSpeed = exposed.velocities[0].amount,
					ySpeed = exposed.velocities[1].amount;
				
				exposed.moveBy(xSpeed, ySpeed);
			};
			
			// // Providing info
			
			exposed.$findConflicts = function() {
				var conflicts = [];
				
				internal.parent.getEntitiesWith("solid").forEach(function(other) {
					var conflict = exposed.findConflictWith(other);
					if (conflict) conflicts.push(conflict);
				});
				
				return conflicts;
			};
			
			exposed.findConflictWith = function(other) {
				if (other == self) return;
				
				var xSpeed = exposed.velocities[0].amount,
					ySpeed = exposed.velocities[1].amount;
				
				var otherProjected = other.getProjectedPosition(),
					selfProjected = exposed.getProjectedPosition();
				
				var strongestAxis = +(exposed.velocities[0].type >= exposed.velocities[1].type);
				
				// X movement
				if (xSpeed) {
					if (selfProjected.x == otherProjected.x && internal.cell.y == otherProjected.y) {
						var selfYVelocityDirection = (exposed.velocities[1].amount/Math.abs(exposed.velocities[1].amount)),
							otherYVelocityDirection = (other.velocities[1].amount/Math.abs(other.velocities[1].amount));
						
						if (selfProjected == otherProjected || selfYVelocityDirection != otherYVelocityDirection) {
							return new PhysicsConflict(self, other, 0);
						}
					}
				}
				
				// Y movement
				if (ySpeed) {
					if (internal.cell.x == otherProjected.x && selfProjected.y == otherProjected.y) {
						var selfXVelocityDirection = (exposed.velocities[0].amount/Math.abs(exposed.velocities[0].amount)),
							otherXVelocityDirection = (other.velocities[0].amount/Math.abs(other.velocities[0].amount));
						
						if (selfProjected == otherProjected || selfXVelocityDirection != otherXVelocityDirection) {
							return new PhysicsConflict(self, other, 1);
						}
					}
				}
				
				// Complete movement
				if (xSpeed && ySpeed) {
					if (selfProjected == otherProjected) {
						return new PhysicsConflict(self, other, strongestAxis);
					}
				}
				
				// Position swap
				if (xSpeed || ySpeed) {
					var selfTargetIsOtherPosition = selfProjected.x == other.cell.x && selfProjected.y == other.cell.y,
						otherTargetIsSelfPosition = otherProjected.x == self.cell.x && otherProjected.y == self.cell.y;
					
					if (selfTargetIsOtherPosition && otherTargetIsSelfPosition) {
						return new PhysicsConflict(self, other, strongestAxis);
					}
				}
				
				return null;
			};
			
			exposed.getProjectedPosition = function() {
				return internal.cell.getWithOffset(exposed.velocities[0].amount, exposed.velocities[1].amount);
			};
		};
		
		common.internal.forceTypes = [
			"inertia_static",
			"actuation_static",
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
