// needs +EntityFactory.js
// needs grid.js

var Machine = SVP2.class(function(common) {

common.constructor = function(worldText) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.grid = null;
	
	internal.entities = [];
	
	// Exposed methods
	exposed.tick = function() {
		// New frame initialization
		internal.entities.forEach(function(entity) {
			entity.beginFrame();
		});
		
		internal.entities.forEach(function(entity) {
			entity.initializeRelationships();
		});
		
		internal.entities.forEach(function(entity) {
			entity.initializePowerState && entity.initializePowerState();
		});
		
		// Power network solving
		var unstableCount = 0,
			previousUnstableCount;
		do {
			previousUnstableCount = unstableCount;
			unstableCount = internal.entities.reduce(function(count, entity) {
				if (!entity.refreshOutputs) return count;
				return count + entity.refreshOutputs();
			}, 0);
		} while (unstableCount != previousUnstableCount);
		
		// Cleanup
		internal.entities.forEach(function(entity) {
			entity.cleanup();
		});
	};
	
	exposed.renderTo = function(renderer) {
		renderer.beginFrame(internal.grid.width, internal.grid.height);
		
		internal.entities.forEach(function(entity) {
			var entityColor = entity.getColor();
			if (entityColor.length < 4) entityColor = entityColor.concat([1]);
			
			var entityBGColor = entity.getBackgroundColor();
			if (entityBGColor.length < 4) entityBGColor = entityBGColor.concat([1]);
			
			renderer.drawObject({
				x: entity.cell.x,
				y: entity.cell.y,
				char: entity.getChar(),
				color: entityColor,
				backgroundColor: entityBGColor
			});
		});
		
		renderer.flushFrame();
	}
	
	exposed.userAction = function(x, y) {
		var cell = internal.grid.getCell(x, y);
		if (cell) {
			cell.getObjects().forEach(function(entity) {
				entity.userAction();
			});
		}
	};
	
	// // Entity management
	exposed.addEntity = function(entity) {
		entity.cell.addObject(entity);
		internal.entities.push(entity);
		return entity;
	};
	
	exposed.removeEntity = function(entity) {
		entity.cell.removeObject(entity);
		var entityIndex = internal.entities.indexOf(entity);
		if (entityIndex > -1) internal.entities.splice(entityIndex, 1);
		return entity;
	};
	
	// Internal methods
	
	// Init
	var lines = worldText.split("\n");
	
	// // Finding world size
	var worldWidth = 0, worldHeight;
	for (var i = 0 ; i < lines.length ; i++) {
		worldWidth = Math.max(worldWidth, lines[i].length);
	}
	worldHeight = lines.length;
	
	// // Creating grid
	internal.grid = new Grid(worldWidth, worldHeight);
	
	// // Generating entities
	var getOtherChar = function(x, y) {
		if (x < 0 || y < 0 || x >= internal.grid.width || y >= internal.grid.height) return null;
		return lines[y][x];
	};
	
	for (var y = 0 ; y < lines.length ; y++) {
		var line = lines[y];
		for (var x = 0 ; x < line.length ; x++) {
			var char = line[x],
				cell = internal.grid.getCell(x, y);
			
			exposed.addEntity(MachineEntityFactory.makeEntity(getOtherChar, self, char, cell));
		}
	}
};

});

