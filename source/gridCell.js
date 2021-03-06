
var GridCell = SVP2.class(function(common) {

common.constructor = function(parentGrid, x, y) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.parentGrid = parentGrid;
	
	internal.x = x;
	internal.y = y;
	internal.objects = [];
		
	// Exposed methods
	exposed.toString = function() {
		return internal.x + ", " + internal.y;
	};
	
	// // Position
	this.expose({
		x: false,
		y: false
	});
	
	exposed.isInsideGrid = function() {
		return internal.parentGrid.contains(internal.x, internal.y);
	};
	
	// // Linked objects
	exposed.getObjects = function() {
		return internal.objects.slice(0);
	};
	
	exposed.containsObject = function(object) {
		return (internal.objects.indexOf(object)) > -1;
	};
	
	exposed.addObject = function(object) {
		internal.objects.push(object);
	};
	
	exposed.removeObject = function(object) {
		var index = internal.objects.indexOf(object);
		
		if (index > -1) {
			internal.objects.splice(index, 1);
		}
	};
	
	// // Neighbor cells
	exposed.getInDirection = function(direction, count) {
		if (count == undefined) count = 1;
		
		var offset = {
			0: [0, -count],
			1: [count, 0],
			2: [0, count],
			3: [-count, 0]
		}[direction];
		
		return exposed.getWithOffset(offset[0], offset[1]);
	};
	
	exposed.getWithOffset = function(x, y) {
		return internal.parentGrid.getCell(internal.x + x, internal.y + y);
	};
	
	exposed.getTop = function(count) {
		return exposed.getInDirection(0, count);
	};
	
	exposed.getRight = function(count) {
		return exposed.getInDirection(1, count);
	};
	
	exposed.getBottom = function(count) {
		return exposed.getInDirection(2, count);
	};
	
	exposed.getLeft = function(count) {
		return exposed.getInDirection(3, count);
	};
	
};

});
