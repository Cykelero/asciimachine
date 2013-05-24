// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("hasTemperature", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.temperature = 0;
			
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				var tempParameters = common.internal.tempParameters;
				
				// Temperature change
				var heatCount = internal.getAffectingBroadcastsOfType("heat", true).length,
					coolCount = internal.getAffectingBroadcastsOfType("cool", true).length;
				
				if (heatCount || coolCount) {
					// Heating/cooling
					internal.temperature += heatCount;
					internal.temperature -= coolCount;
				} else {
					// Passive restoration to neutral state
					if (internal.temperature > 0) {
						internal.temperature -= tempParameters.zeroRestorationSpeed;
						internal.temperature = Math.max(internal.temperature, 0);
					} else if (internal.temperature < 0) {
						internal.temperature += tempParameters.zeroRestorationSpeed;
						internal.temperature = Math.min(internal.temperature, 0);
					}
				}
				
				if (tempParameters.negativeThreshold == null) internal.temperature = Math.max(0, internal.temperature);
				if (tempParameters.positiveThreshold == null) internal.temperature = Math.min(0, internal.temperature);
				
				// Transformation
				if (tempParameters.negativeResultType && internal.temperature <= tempParameters.negativeThreshold) {
					var type = tempParameters.negativeResultType,
						replacement = new types[type](internal.parent, type, internal.cell);
					internal.parent.addEntity(replacement);
					internal.parent.removeEntity(self);
					replacement.$beginFrame();
				} else if (tempParameters.positiveResultType && internal.temperature >= tempParameters.positiveThreshold) {
					var type = tempParameters.positiveResultType,
						replacement = new types[type](internal.parent, type, internal.cell);
					internal.parent.addEntity(replacement);
					internal.parent.removeEntity(self);
					replacement.$beginFrame();
				}
			};
		};
		
		common.internal.tempParameters = {
			zeroRestorationSpeed: null,
			negativeThreshold: null,
			negativeResultType: null,
			positiveThreshold: null,
			positiveResultType: null
		};
	}];
});
