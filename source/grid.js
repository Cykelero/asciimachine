// needs +Cell.js

var Grid = SVP2.class(function(common) {

common.constructor = function(width, height) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.width = width;
	internal.height = height;
	
	internal.columns = [];
	
	// Exposed methods
	this.expose({
		width: false,
		height: false
	});
	
	exposed.getCell = function(x, y) {
		if (x < 0 || y < 0 || x >= internal.width || y >= internal.height) return null;
		return internal.columns[x][y];
	};
	
	// Init
	for (var x = 0 ; x < width ; x++) {
		var column = [];
		internal.columns.push(column);
		for (var y = 0 ; y < height ; y++) {
			column[y] = new GridCell(self, x, y);
		}
	}
};

});
