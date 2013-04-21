// needs effect.js

var LineEffect = SVP2.class(Effect, function(common) {

common.constructor = function(color, width) {
	var exposed = this.exposed,
		internal = this.internal,
		parent = this.parent,
		self = exposed;
	
	parent("line");
	
	internal.color = color || [255, 0, 0, 1];
	internal.width = width || 1;
	
	internal.points = [];
	
	this.expose({
		color: false,
		width: false,
		points: false
	});
	
	// Exposed methods
	exposed.addPoint = function(point) {
		internal.points.push(point);
	};
	
};

});
