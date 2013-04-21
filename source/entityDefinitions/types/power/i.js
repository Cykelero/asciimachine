// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("i", function(attr, types) {
	return [attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.color = [255, 240, 210];
			internal.poweredColor = [255, 180, 0];
			
			internal.vetoIncomingConnection = function(connection) {
				var info = connection.info;
				
				return info.kind == "laser";
			};
		};
		
		common.internal.name = "laserReceiver";
	}];
});
