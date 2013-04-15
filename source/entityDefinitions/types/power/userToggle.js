// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/conductor.js

MachineEntityTypesAggregator.defineType("@", function(attr, types) {
	return [attr.fixed, attr.conductor, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.enabled = false;
			
			internal.poweredColor = [100, 255, 220];
			
			// Behavior
			exposed.$beginFrame = function() {
				parent.exposed.$beginFrame();
				
				internal.wiredDirections = internal.enabled ? Direction.all() : [];
			};
			
			exposed.$userAction = function() {
				internal.enabled = !internal.enabled;
			};
			
			// Rendering
			exposed.getBackgroundColor = function() {
				return internal.enabled ? [50, 170, 100] : [130, 10, 10];
			};
		};
		
		common.internal.name = "userSwitch";
	}];
});
