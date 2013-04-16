// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/conveyorPiece.js

MachineEntityTypesAggregator.defineType("conveyorBelt", function(attr, types) {
	return [attr.conveyorPiece, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [120, 142, 44];
		};
		
		common.internal.name = "conveyorBelt";
	}];
});
