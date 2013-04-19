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
			
			internal.color = [220, 220, 220];
			internal.backgroundColor = [130, 130, 130];
			
			internal.doesBeamTraverse = function(cell) {
				return cell.getObjects().every(function(entity) {
					return !entity.has("fixed");
				});
			};
			
			internal.getBroadcastType = function(direction) {
				return "reverseGravity";
			};
		};
		
		common.internal.name = "gravityReverser";
		
		common.internal.defaultBeamDirections = [Direction.up];
	}];
});
