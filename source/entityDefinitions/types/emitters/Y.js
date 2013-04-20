// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/beamer.js

MachineEntityTypesAggregator.defineType("Y", function(attr, types) {
	return [attr.fixed, attr.conductor, attr.beamer, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [50, 160, 200];
			internal.poweredBackgroundColor = [60, 130, 170];
			
			internal.doesBeamTraverse = function(cell, distance) {
				if (distance == 0) return true;
				
				return cell.getObjects().every(function(entity) {
					return !entity.has("fixed");
				});
			};
			
			internal.getBroadcastInfo = function(direction) {
				return {
					type: "reverseGravity"
				};
			};
			
			exposed.getBackgroundColor = function() {
				return exposed.isPowered() ? internal.poweredBackgroundColor : internal.backgroundColor;
			};
		};
		
		common.internal.name = "gravityReverser";
		
		common.internal.defaultBeamDirections = [Direction.up];
	}];
});
