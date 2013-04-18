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
				
				var bottomHasSolid = internal.cell.getBottom().getObjects().some(function(entity) {
					return entity.has("solid") && !entity.has("fluid");
				});
				
				if (internal.parent.getCurrentFrame() == 0) return;
				
				if (!bottomHasSolid) return;
				
				if (internal.cellBeforePressureApplication != internal.cell) return;
				
				if (exposed.velocities[0].amount || exposed.velocities[1].amount) return;
				
				var xOffsets = Math.round(Math.random()) ?
					[-1, 1]
					: [1, -1];
				
				for (var o = 0; o < xOffsets.length ; o++) {
					var xOffset = xOffsets[o];
					
					var neighborCell = internal.cell.getWithOffset(xOffset, 0),
						lowerCell = internal.cell.getWithOffset(xOffset, 1);
					
					var neighborHasSolid = neighborCell.getObjects().some(function(entity) {
						return entity.has("solid");
					});
					
					var lowerHasSolid = lowerCell.getObjects().some(function(entity) {
						return entity.has("solid");
					});
					
					var lowerHasFluid = lowerCell.getObjects().some(function(entity) {
						return entity.has("fluid");
					});
					
					if (!neighborHasSolid && (!lowerHasSolid || lowerHasFluid)) {
						exposed.applyForce({
							axis: 0,
							amount: xOffset,
							type: common.internal.forceTypes["gravity_"+common.internal.weight]
						});
						break;
					}
				};
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
			
			internal.color = [0, 0, 0];
			internal.backgroundColor = [255, 255, 255, .5];
		};
		
		common.internal.weight = "extralight";
	}];
});
