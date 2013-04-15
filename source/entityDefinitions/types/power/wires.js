// needs machineEntityTypesAggregator.js

// needs entityDefinitions/attributes/wire.js

MachineEntityTypesAggregator.defineType("-", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [Direction.right, Direction.left];
			
			// Init
			var crossedWire = new types.verticalCrossedWire(internal.parent, "", internal.cell);
			internal.attachEntity(crossedWire);
			internal.parent.addEntity(crossedWire);
		};
		
		common.internal.name = "wire-horizontal";
		
		common.internal.depth = common.internal.depths.background;
	}];
});

MachineEntityTypesAggregator.defineType("|", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
			internal.wiredDirections = [Direction.up, Direction.down];
			
			// Init
			var crossedWire = new types.horizontalCrossedWire(internal.parent, "", internal.cell);
			internal.attachEntity(crossedWire);
			internal.parent.addEntity(crossedWire);
		};
		
		common.internal.name = "wire-vertical";
		
		common.internal.depth = common.internal.depths.background;
	}];
});

MachineEntityTypesAggregator.defineType("e", function(attr, types) {
	return [attr.wire, function(common) {
		common.constructor = function() {
			var exposed = this.exposed,
				internal = this.internal,
				parent = this.parent,
				self = exposed;
			
		};
		
		common.internal.name = "wire-both";
		
		common.internal.depth = common.internal.depths.background;
	}];
});
