// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/powerGate.js

MachineEntityTypesAggregator.defineType("%", function(attr, types) {
	return [attr.powerGate, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			// Power node
			internal.refreshPowerState = function() {
				var powerCount = internal.powerState.getPowerCount(),
					unstableCount = internal.powerState.getUnstableCount();
				
				if (unstableCount > 0) return;
				
				var outputsPower = (powerCount == 1);
				internal.powerState.setAllOutputs(outputsPower);
			};
		};
		
		common.internal.name = "XOR";
	}];
});
