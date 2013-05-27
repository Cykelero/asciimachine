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
				
				internal.resetVelocities();
			};
			
			exposed.getLightDirection = function(direction) {
				return null;
			};
			
			// Physics
			internal.resetVelocities = function() {
				var inertiaType = common.internal.forceTypes["inertia_" + common.internal.weight];
				exposed.velocities = [
					{amount: 0, type: inertiaType},
					{amount: 0, type: inertiaType}
				];
			};
			
			// // Acting
			exposed.$generateForces = function() {
				var remoteForces = internal.getAffectingBroadcastsOfType("applyForce");
				
				remoteForces.forEach(function(info) {
					if (common.internal.specialForceTypes.indexOf(info.data.kind) > -1) {
						exposed.applyForce(info.data.force);
					}
				});
			};
			
			exposed.applyForce = function(parameters) {
				var axis = +parameters.axis,
					amount = parameters.amount,
					type = typeof(parameters.type) == "number" ? parameters.type : common.internal.forceTypes[parameters.type];
				
				var currentForce = exposed.velocities[axis];
				var prevails = (type < currentForce.type);
				
				if (prevails) {
					// New force replaces current one
					exposed.velocities[axis] = {
						amount: amount,
						type: type
					};
				} else if (type == currentForce.type) {
					// Combine forces in a weird way
					var absoluteMax = Math.max(Math.abs(amount), Math.abs(currentForce.amount));
					
					var totalAmount = amount + currentForce.amount,
						totalSign = totalAmount > 0 ? 1 : -1,
						signedMax = absoluteMax * totalSign;
					
					if (totalSign == 1) {
						totalAmount = Math.min(signedMax, totalAmount);
					} else {
						totalAmount = Math.max(signedMax, totalAmount);
					}
					
					currentForce.amount = totalAmount;
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
			
			exposed.$onWinConflict = function(loser, losingForce, newLoserForceAmount) {
				
			};
			
			// // Providing info
			exposed.$findConflicts = function() {
				var conflicts = [];
				
				// Find all conflicts
				var maxDistance = 3; // slightly arbitrary. related to max speed (1)
				
				for (var x = -maxDistance ; x <= maxDistance ; x++) {
					for (var y = -maxDistance ; y <= maxDistance ; y++) {
						var cell = internal.cell.getWithOffset(x, y);
						cell.getObjects().filter(function(entity) {
							return entity.has("solid");
						}).forEach(function(other) {
							var conflict = exposed.findConflictWith(other);
							if (conflict) conflicts.push(conflict);
						});
					}
				}
				
				// Sort conflicts
				conflicts.sort(function(a, b) {
					var priorityDifference = a.getPriority() - b.getPriority(),
						strongestForceDifference = a.getStrongestForceType() - b.getStrongestForceType(),
						forceTotalDifference = a.getForceTypeTotal() - b.getForceTypeTotal();
					
					return priorityDifference || strongestForceDifference || forceTotalDifference;
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
							var conflict = internal.makeConflictWith(other, 0, 1);
							if (conflict) return conflict;
						}
					}
				}
				
				// Y movement
				if (ySpeed) {
					if (internal.cell.x == otherProjected.x && selfProjected.y == otherProjected.y) {
						var selfXVelocityDirection = (exposed.velocities[0].amount/Math.abs(exposed.velocities[0].amount)),
							otherXVelocityDirection = (other.velocities[0].amount/Math.abs(other.velocities[0].amount));
						
						if (selfProjected == otherProjected || selfXVelocityDirection != otherXVelocityDirection) {
							var conflict = internal.makeConflictWith(other, 1, 1);
							if (conflict) return conflict;
						}
					}
				}
				
				// Complete movement
				if (xSpeed && ySpeed) {
					if (selfProjected == otherProjected) {
						var conflict = internal.makeConflictWith(other, strongestAxis, 2);
						if (conflict) return conflict;
					}
				}
				
				// Position swap
				if (xSpeed || ySpeed) {
					var selfTargetIsOtherPosition = selfProjected == other.cell,
						otherTargetIsSelfPosition = otherProjected == self.cell;
					
					if (selfTargetIsOtherPosition && otherTargetIsSelfPosition) {
						var conflictAxis;
						if (xSpeed && ySpeed) {
							conflictAxis = strongestAxis;
						} else if (xSpeed) {
							conflictAxis = 0;
						} else {
							conflictAxis = 1;
						}
						
						var conflict = internal.makeConflictWith(other, conflictAxis, 0);
						if (conflict) return conflict;
					}
				}
				
				return null;
			};
			
			internal.makeConflictWith = function(other, axis, priority) {
				if (exposed.doesCollideWith(other) && other.doesCollideWith(self)) {
					return new PhysicsConflict(self, other, axis, priority);
				}
			};
			
			exposed.doesCollideWith = function(other) {
				return true;
			};
			
			exposed.getProjectedPosition = function() {
				return internal.cell.getWithOffset(exposed.velocities[0].amount, exposed.velocities[1].amount);
			};
			
			exposed.getWeight = function() {
				return common.internal.weight;
			};
			
			// Init
			internal.resetVelocities();
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
			"inertia_light",
			"gravity_extralight",
			"friction_extralight",
			"inertia_extralight"
		].reduce(function(map, item, index) {
			map[item] = index;
			return map;
		}, {});
		
		common.internal.weight = "normal";
		
		common.internal.specialForceTypes = ["wind"];
	}];
});
