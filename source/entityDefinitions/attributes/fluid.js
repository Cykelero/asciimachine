// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/solid.js

MachineEntityTypesAggregator.defineAttribute("fluid", function(attr, types) {
	return [attr.solid, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.cellBeforePressureApplication = null;
			
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				internal.cellBeforePressureApplication = internal.cell;
			};
			
			exposed.$generateForces = function() {
				parent.exposed.$generateForces();
				
				// Flowing behavior
				// // Only flow in certain cases
				function hasEligibleSolid(cell) {
					return cell.getObjects().some(function(entity) {
							return exposed.doesCollideWith(entity);
						});
				};
				
				var bottomHasSolid = internal.cell.getBottom().getObjects().some(function(entity) {
					return entity.has("solid") && exposed.doesCollideWith(entity) && !entity.has("fluid");
				});
				
				if (internal.parent.getCurrentFrame() == 0) return;
				
				if (!bottomHasSolid) return;
				
				if (internal.cellBeforePressureApplication != internal.cell) return;
				
				if (exposed.velocities[0].amount || exposed.velocities[1].amount) return;
				
				// // Check both flow directions; order is random
				var xOffsets = Math.round(Math.random()) ?
					[-1, 1]
					: [1, -1];
				
				for (var o = 0; o < xOffsets.length ; o++) {
					var xOffset = xOffsets[o];
					
					// Side-specific checks
					var neighborCell = internal.cell.getWithOffset(xOffset, 0),
						lowerCell = internal.cell.getWithOffset(xOffset, 1);
					
					var neighborHasSolid = hasEligibleSolid(neighborCell);
										
					var lowerHasSolid = hasEligibleSolid(lowerCell);
										
					var lowerHasFluid = lowerCell.getObjects().some(function(entity) {
						return entity.has("fluid");
					});
					
					// Flow
					if (!neighborHasSolid && (!lowerHasSolid || lowerHasFluid)) {
						exposed.applyForce({
							axis: 0,
							amount: xOffset,
							type: "inertia_"+common.internal.weight
						});
						break;
					}
				};
			};
			
			exposed.doesCollideWith = function(entity) {
				var collides = (entity.has("solid") && entity.getWeight() == "static")
					|| (entity.has("fluid") && entity.getFluidType() == exposed.getFluidType());
				
				return parent.exposed.doesCollideWith(entity)
					&& collides;
			};
			
			exposed.$onWinConflict = function(loser, losingForce, newLoserForceAmount) {
				parent.exposed.$onWinConflict(loser, losingForce, newLoserForceAmount);
				
				if (!loser.has("fluid") || true) {
					internal.parent.addFluidPressurePoint({
						from: loser.cell,
						to: internal.cell,
						solid: loser,
						fluid: self
					});
				}
			};
			
			exposed.getFluidType = function() {
				return common.internal.fluidType;
			};
			
			internal.color = [0, 0, 0];
			internal.backgroundColor = [255, 255, 255, .5];
		};
		
		common.internal.weight = "extralight";
		
		common.internal.fluidType;
	}];
});
