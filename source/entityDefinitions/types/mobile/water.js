// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fluid.js
// needs entityDefinitions/attributes/gravity.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/hasTemperature.js

MachineEntityTypesAggregator.defineType("~", function(attr, types) {
	return [attr.fluid, attr.gravity, attr.conductor, attr.hasTemperature, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 255, 255];
			internal.backgroundColor = [40, 90, 150];
	
			exposed.getLightDirection = function(direction) {
				return direction;
			};
		};
		
		common.internal.name = "water";
		
		common.internal.depth = common.internal.depths.background2;
		
		common.internal.fluidType = "liquid";
		
		common.internal.tempParameters = {
			zeroRestorationSpeed: 1,
			negativeThreshold: -3,
			negativeResultType: "s",
			positiveThreshold: 3,
			positiveResultType: "§"
		};
	}];
});
