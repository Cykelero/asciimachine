// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/beamer.js

MachineEntityTypesAggregator.defineType("F", function(attr, types) {
	return [attr.fixed, attr.conductor, attr.beamer, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [150, 40, 170];
			
			internal.doesBeamTraverse = function(cell, distance) {
				return cell.getObjects().every(function(entity) {
					return !entity.has("fixed");
				});
			};
			
			internal.getBroadcastInfo = function(direction) {
				return {
					type: "applyForce",
					data: {
						force: {
							axis: Direction.getAxis(direction),
							amount: Direction.getAxisAmplitude(direction),
							type: "wind_light"
						},
						kind: "wind"
					}
				};
			};
		};
		
		common.internal.name = "fan";
	}];
});
