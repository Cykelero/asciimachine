// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/powerGate.js

MachineEntityTypesAggregator.defineType("&", function(attr, types) {
	return [attr.powerGate, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			// Power node
			internal.refreshPowerState = function() {
				var requiredFalseCount = internal.powerState.inputs.length - 1;
				
				// False?
				var falseCount = internal.powerState.inputs.reduce(function(count, input) {
					return count + (input.value === false);
				}, 0);
				
				if (falseCount >= requiredFalseCount) {
					internal.powerState.setAllOutputs(false);
					return;
				}
				
				// True?
				var trueCount = internal.powerState.getPowerCount();
				if (trueCount >= 2) {
					internal.powerState.setAllOutputs(true);
					return;
				}
			};
		};
		
		common.internal.name = "AND";
	}];
});
