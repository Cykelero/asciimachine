// needs machineEntityTypesAggregator.js

// needs powerState.js
// needs powerConnection.js

MachineEntityTypesAggregator.defineAttribute("powerNode", function(attr, types) {
	return [function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.powerState = null;
			
			internal.poweredColor = [70, 190, 255];
			
			// Behavior
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				internal.powerState = new PowerState(self);
			};
			
			exposed.$initializePowerState = function() {
				if (!internal.isAffectedBy("inhibitPower")) internal.initializeOutputs();
			};
			
			// Power node
			exposed.$refreshOutputs = function() {
				if (internal.isAffectedBy("inhibitPower")) return true;
				
				internal.refreshPowerState();
				
				return internal.powerState.isStable();
			};
			
			exposed.inputPower = function(connection) {
				if (internal.isAffectedBy("inhibitPower")) return false;
				
				var accept = internal.vetoIncomingConnection(connection);
				if (accept) internal.powerState.addInput(connection);
				return accept;
			};
			
			exposed.comparePowerStateTo = function(powerState) {
				return internal.powerState == powerState;
			};
			
			internal.initializeOutputs;
			
			internal.vetoIncomingConnection;
			
			internal.refreshPowerState;
			
			internal.proposeConnection = function(target, info) {
				if (target.has("powerNode") && target.comparePowerStateTo(internal.powerState)) {
					return false;
				};
				
				var connection = new PowerConnection({
					from: self,
					to: target,
					info: info
				});
				
				var accepted = target.has("powerNode") && target.inputPower(connection);
				if (accepted) {
					internal.powerState.addOutput(connection);
				}
				
				return accepted;
			};
			
			// Display
			exposed.isPowered = function() {
				if (internal.isAffectedBy("inhibitPower")) return false;
				
				return internal.powerState.outputs.some(function(output) {
					return output.value;
				});
			};
			
			exposed.getColor = function() {
				return exposed.isPowered() ? internal.poweredColor : parent.exposed.getColor();
			};
		};
	}];
});
