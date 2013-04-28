// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/beamer.js

MachineEntityTypesAggregator.defineType("U", function(attr, types) {
	return [attr.fixed, attr.conductor, attr.beamer, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255, .7];
			internal.poweredColor = [255, 240, 0];
			internal.backgroundColor = [130, 90, 0];
			internal.poweredBackgroundColor = [200, 130, 0];
			
			internal.doesBeamTraverse = function(cell, distance) {
				return cell.getObjects().every(function(entity) {
					return !entity.has("solid") || !entity.has("powerNode");
				});
			};
			
			internal.getBroadcastInfo = function(direction) {
				direction = Direction.flip(direction);
				return {
					type: "applyForce",
					data: {
						force: {
							axis: Direction.getAxis(direction),
							amount: Direction.getAxisAmplitude(direction),
							type: "magnetic_normal"
						}
					}
				};
			};
			
			exposed.getBackgroundColor = function() {
				return exposed.isPowered() ? internal.poweredBackgroundColor : internal.backgroundColor;
			};
		};
		
		common.internal.name = "magnet";
	}];
});
