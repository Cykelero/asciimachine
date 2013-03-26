// needs machineEntityTypesAggregator.js

MachineEntityTypesAggregator.defineAttribute("conductor", function(attr, types) {
	return [attr.powerNode, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = Direction.all();
			internal.powerStateIsShared = null;
			
			exposed.beginFrame = function() {
				parent.exposed.beginFrame();
				
				internal.powerStateIsShared = false;
			};
			
			exposed.spreadPowerState = function() {
				internal.spreadPowerState();
			};
			
			internal.initializeOutputs = function() {
				internal.wiredDirections.forEach(function(direction) {
					internal.getNeighborsFrom([direction]).forEach(function(info) {
						internal.proposeConnection(info.entity, {direction: info.direction, kind: "contact"});
					});
				});
			};
			
			internal.vetoIncomingConnection = function(connection) {
				var info = connection.info;
				
				return info.kind == "contact" && internal.wiredDirections.indexOf(Direction.flip(info.direction)) > -1;
			};
			
			internal.refreshPowerState = function() {
				var powered = internal.powerState.inputs.some(function(input) {
					return input.value;
				});
				
				if (powered) {
					internal.powerState.setAllOutputs(true);
				} else if (internal.powerState.getUnstableCount() == 0) {
					internal.powerState.setAllOutputs(false);
				}
			};
			
			// Power state spreading
			internal.spreadPowerState = function() {
				if (internal.powerStateIsShared) return;
				
				internal.powerStateIsShared = true;
				
				internal.getNeighborsFrom(internal.wiredDirections).forEach(function(info) {
					var entity = info.entity;
					entity.sharePowerState && entity.sharePowerState({direction: info.direction}, internal.powerState);
				});
			};
			
			exposed.sharePowerState = function(info, powerState) {
				if (internal.powerStateIsShared) return;
				
				if (internal.wiredDirections.indexOf(Direction.flip(info.direction)) == -1) return;
				
				internal.powerState = powerState;
				internal.spreadPowerState();
			};
			
			// Display
			exposed.isPowered = function() {
				return internal.powerState.inputs.some(function(input) {
					return input.value;
				});
			};
		};
	}];
});
