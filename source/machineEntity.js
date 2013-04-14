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
	
	exposed.getName = function() {
		return common.internal.name;
	};
	
	exposed.has = function(attributeName) {
		return common.internal.attributes[attributeName];
	};
	
	// // Behavior
	exposed.initializeRelationships = function() {
		
	};
	
	exposed.$beginFrame = function() {
		
	};
	
	exposed.userAction = function() {
		
	};
	
	// // Other
	exposed.moveBy = function(x, y) {
		if (x == 0 && y == 0) return;
		
		internal.attachedEntities.forEach(function(entity) {
			entity.moveBy(x, y);
		});
		
		var targetCell = internal.cell.getWithOffset(x, y);
		internal.cell.removeObject(self);
		internal.cell = targetCell;
		internal.cell.addObject(self);
	};
	
	exposed.moveTo = function(newCell) {
		exposed.moveBy(newCell.x-internal.cell.x, newCell.y-internal.cell.y);
	};
	
	internal.attachEntity = function(entity) {
		internal.attachedEntities.push(entity);
	};
	
	internal.detachEntity = function(entity) {
		var index = internal.attachedEntities.indexOf(entity);
		
		if (index > -1) {
			internal.attachedEntities.splice(index, 1);
		}
	};
	
	// // Display
	exposed.getChar = function() {
		return internal.displayChar;
	};
	
	exposed.getDepth = function() {
		return common.internal.depth;
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
	
	internal.getAffectingBroadcasts = function() {
		return internal.parent.getBroadcastsForCell(internal.cell);
	};
	
	internal.getAffectingBroadcastsOfType(type) {
		return internal.getAffectingBroadcasts().filter(function(broadcast) {
			return (broadcast.type == type);
		});
	};
	
};

// Internal		
common.internal.name;

common.internal.attributes = {};
	
common.exposed.setHasAttribute = function(attributeName, has) {
	common.internal.attributes[attributeName] = has;
};

common.internal.depths = [
	"overlay",
	"normal",
	"background"
].reduce(function(map, item, index) {
	map[item] = index;
	return map;
}, {});

common.internal.depth = common.internal.depths.normal;

});
