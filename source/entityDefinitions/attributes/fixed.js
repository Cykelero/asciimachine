// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/solid.js

MachineEntityTypesAggregator.defineAttribute("fixed", function(attr, types) {
	return [attr.solid, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [0, 0, 0];
			internal.backgroundColor = [255, 255, 255];
			
			exposed.doesCollideWith = function(entity) {
				return parent.exposed.doesCollideWith(entity)
					&& !entity.has("fixed");
			}
		};
		
		common.internal.weight = "static";
	}];
});
