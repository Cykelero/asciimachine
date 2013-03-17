// needs +EntityFactory.js
// needs grid.js

var Machine = SVP2.class(function(common) {

this(function(worldText) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.grid = null;
	
	internal.entities = [];
	
	// Exposed methods
	exposed.tick = function() {
		console.log("###### TICK ######");
		internal.entities.forEach(function(entity) {
			entity.beginFrame();
		});
		
		internal.entities.forEach(function(entity) {
			entity.tick();
		});
	};
	
	exposed.renderTo = function(renderer) {
		renderer.beginFrame(internal.grid.width, internal.grid.height);
		
		internal.entities.forEach(function(entity) {
			renderer.drawObject(entity.cell.x, entity.cell.y, entity.getChar(), entity.getColor());
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
			
			var entity = MachineEntityFactory.makeEntity(getOtherChar, char, cell);
			cell.addObject(entity);
			
			internal.entities.push(entity);
		}
	}
});

// Exposed

// Internal

});

