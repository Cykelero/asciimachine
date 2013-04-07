// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("arrow", function(attr, types) {
	return [attr.fixed, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			exposed.getDirection = function() {
				return common.internal.direction;
			};
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [100, 180, 100];
		};
		
		common.internal.direction;
	}];
});
