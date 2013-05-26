// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fluid.js
// needs entityDefinitions/attributes/gravity.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/hasTemperature.js

MachineEntityTypesAggregator.defineType("§", function(attr, types) {
	return [attr.fluid, attr.antiGravity, attr.hasTemperature, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [200, 200, 200, .7];
			internal.backgroundColor = [255, 255, 255, .25];
	
			exposed.getLightDirection = function(direction) {
				return direction;
			};
		};
		
		common.internal.name = "steam";
		
		common.internal.depth = common.internal.depths.background;
		
		common.internal.fluidType = "gas";
		
		common.internal.tempParameters = {
			zeroRestorationSpeed: 1,
			negativeThreshold: -2,
			negativeResultType: "~"
		};
	}];
});
