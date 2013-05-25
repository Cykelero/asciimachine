// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/hasTemperature.js

MachineEntityTypesAggregator.defineType("s", function(attr, types) {
	return [attr.fixed, attr.hasTemperature, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255, .8];
			internal.backgroundColor = [40, 130, 160];
	
			exposed.getLightDirection = function(direction) {
				return direction;
			};
		};
		
		common.internal.name = "ice";
		
		common.internal.tempParameters = {
			zeroRestorationSpeed: 1,
			isHeatedByLasers: true,
			positiveThreshold: 2,
			positiveResultType: "~"
		};
	}];
});
