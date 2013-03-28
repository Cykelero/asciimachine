// needs direction.js

var MachineEntity = SVP2.class(function(common) {

common.constructor = function(parent, char, cell) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.parent = parent;
	internal.cell = cell;
	
	internal.attachedEntities = [];
	
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
	
	exposed.userAction = function() {
		
	};
	
	// // Display
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
		return internal.getNeighborsFrom(Direction.all());
	};
	
	internal.getNeighborsFrom = function(directions) {
		var neighbors = [];
		
		directions.forEach(function(direction) {
			var cell = internal.cell.getInDirection(direction);
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
	
	internal.moveBy = function(x, y) {
		internal.attachedEntities.forEach(function(entity) {
			entity.moveBy(x, y);
		});
		
		var targetCell = internal.cell.getWithOffset([x, y]);
		internal.cell.removeObject(self);
		internal.cell = targetCell;
		internal.cell.addObject(self);
	};
	
	internal.moveTo = function(newCell) {
		internal.moveBy(newCell.x-internal.cell.x, newCell.y-internal.cell.y);
	};
	
};

});
