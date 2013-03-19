
var MachineEntity = SVP2.class(function(common) {

common.constructor = function(parent, char, cell) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.parent = parent;
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
	exposed.initializeRelationships = function() {
		
	};
	
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
		return internal.getNeighborsFrom([0, 1, 2, 3]);
	};
	
	internal.getNeighborsFrom = function(directions) {
		var neighbors = [],
			neighborCells;
		
		neighborCells = [
			directions.indexOf(0) > -1 ? internal.cell.getTop() : null,
			directions.indexOf(1) > -1 ? internal.cell.getRight() : null,
			directions.indexOf(2) > -1 ? internal.cell.getBottom() : null,
			directions.indexOf(3) > -1 ? internal.cell.getLeft() : null
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
	
};

});
