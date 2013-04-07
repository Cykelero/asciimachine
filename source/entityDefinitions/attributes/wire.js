// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineAttribute("wire", function(attr, types) {
	return [attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.doesAcceptCrosswireFrom = function(direction) {
				return internal.wiredDirections.indexOf(Direction.flip(direction)) > -1;
			};
		};
	}];
});
