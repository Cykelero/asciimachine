
var MachineEntity = SVP2.class(function(common) {

this(function(char, cell) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.cell = cell;
	
	internal.isSolid = false;
	internal.isPowerNode = false;
	
	internal.displayChar = char;
	internal.color = [255, 255, 255];
	internal.backgroundColor = [255, 255, 255, 0];
	
	// Exposed methods
	// // Attributes
	this.expose({
		cell: function() {
			internal.moveTo(cell);
		}
	});
	
	this.expose({
		isSolid: false,
		isPowerNode: false
	});
	
	// // Behavior
	exposed.beginFrame = function() {
		
	};
	
	exposed.tick = function() {
		
	};
	
	exposed.userAction = function() {
		
	};
	
	// // // World
	exposed.getPowerState = function() {
		return {state: [false, false, false, false]};
	};
	
	// // Rendering
	exposed.getChar = function() {
		return internal.displayChar;
	};
	
	exposed.getColor = function() {
		return internal.color;
	};
	
	exposed.getBackgroundColor = function() {
		return internal.backgroundColor;
	};
	
	// Internal methods
	internal.getCloseNeighbors = function() {
		var neighbors = [],
			neighborCells;
		
		neighborCells = [
			internal.cell.getTop(),
			internal.cell.getRight(),
			internal.cell.getBottom(),
			internal.cell.getLeft()
		];
		
		neighborCells.forEach(function(cell, direction) {
			if (!cell) return;
			
			cell.getObjects().forEach(function(entity) {
				if (entity != self) {
					neighbors.push({
						entity: entity,
						direction: direction
					});
				}
			});
		});
		
		return neighbors;
	};
	
	internal.moveTo = function(newCell) {
		internal.cell.removeObject(self);
		internal.cell = newCell;
		internal.cell.addObject(self);
	};
	
	// Init
	
});

// Exposed

// Internal

});
