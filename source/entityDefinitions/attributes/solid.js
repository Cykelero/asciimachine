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
				var prevails = (currentForce == null)
					|| (type < currentForce.type);
				
				if (prevails) {
					// New forces replaces current one
					exposed.velocities[axis] = {
						amount: amount,
						type: type
					};
				} else if (type == currentForce.type) {
					// New force adds to (or cancels) current one
					currentForce.amount += amount;
				}
			};
			
			exposed.$applyComputedForces = function() {
				var xSpeed = exposed.velocities[0].amount,
					ySpeed = exposed.velocities[1].amount;
				
				exposed.moveBy(xSpeed, ySpeed);
			};
			
			// // Providing info
			
			exposed.$findConflicts = function(step) {
				var conflicts = [],
					xSpeed = exposed.velocities[0].amount,
					ySpeed = exposed.velocities[1].amount;
				
				internal.parent.getEntitiesWith("solid").forEach(function(other) {
					if (other == self) return;
					
					var otherProjected = other.getProjectedPosition(),
						selfProjected = exposed.getProjectedPosition();
					
					var strongestAxis = +(exposed.velocities[0].type >= exposed.velocities[1].type);
					
					// X movement
					if (xSpeed) {
						if (selfProjected.x == otherProjected.x && internal.cell.y == otherProjected.y) {
							conflicts.push(new PhysicsConflict(self, other, 0));
							return;
						}
					}
					
					// Y movement
					if (ySpeed) {
						if (internal.cell.x == otherProjected.x && selfProjected.y == otherProjected.y) {
							conflicts.push(new PhysicsConflict(self, other, 1));
							return;
						}
					}
					
					// Complete movement
					if (selfProjected.x == otherProjected.x && selfProjected.y == otherProjected.y) {
						conflicts.push(new PhysicsConflict(self, other, strongestAxis));
						return;
					}
					
					// Position swap
					var selfTargetIsOtherPosition = selfProjected.x == other.cell.x && selfProjected.y == other.cell.y,
						otherTargetIsSelfPosition = otherProjected.x == self.cell.x && otherProjected.y == self.cell.y;
					if (selfTargetIsOtherPosition && otherTargetIsSelfPosition) {
						conflicts.push(new PhysicsConflict(self, other, strongestAxis));
						return;
					}
				});
				
				return conflicts;
			};
			
			exposed.getProjectedPosition = function(step) {
				return {
					x: internal.cell.x + exposed.velocities[0].amount,
					y: internal.cell.y + exposed.velocities[1].amount
				};
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
