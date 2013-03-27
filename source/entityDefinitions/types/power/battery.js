// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineType("#", function(attr, types) {
	return [attr.fixed, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.backgroundColor = [50, 100, 170];
			internal.poweredColor = [100, 220, 255];
			
			internal.refreshPowerState = function() {
				internal.powerState.setAllOutputs(true);
			};
			
			exposed.isPowered = function() {
				return true;
			};
			
			exposed.sharePowerState = function() {
			};
			internal.spreadPowerState = function() {
			};
		};
	}];
});
