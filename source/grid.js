// needs +Cell.js

var Grid = SVP2.class(function(common) {

common.constructor = function(width, height, border) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.width = width;
	internal.height = height;
	
	internal.borderEnabled = border;
	
	internal.columns = [];
	
	// Exposed methods
	this.expose({
		width: false,
		height: false
	});
	
	exposed.getCell = function(x, y) {
		var column = internal.columns[x];
		if (!column) return null;
		
		var cell = column[y];
		if (!cell) return null;
		
		return cell;
	};
	
	// Init
	for (var x = 0 ; x < width ; x++) {
		var column = [];
		internal.columns.push(column);
		for (var y = 0 ; y < height ; y++) {
			column[y] = new GridCell(self, x, y);
		}
	}
	
	if (internal.borderEnabled) {
		internal.columns[-1] = [];
		internal.columns[width] = [];
		
		for (var x = -1 ; x <= width ; x++) {
			internal.columns[x][-1] = new GridCell(self, x, -1);
			internal.columns[x][height] = new GridCell(self, x, height);
		}
		
		for (var y = 0 ; y < height ; y++) {
			internal.columns[-1][y] = new GridCell(self, -1, y);
			internal.columns[width][y] = new GridCell(self, width, y);
		}
	}
};

});
