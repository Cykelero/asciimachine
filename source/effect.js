
var Effect = SVP2.class(function(common) {

common.constructor = function(type) {
	var exposed = this.exposed,
		internal = this.internal,
		self = exposed;
	
	internal.type = type;
	
	this.expose({
		type: false
	});
};

});
