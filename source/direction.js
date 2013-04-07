
var Direction = SVP2.staticClass(function(common) {

common.implicit = function(direction) {
	return direction%4 || 0;
};

// Exposed
var exposed = common.exposed;

exposed.up = 0;
exposed.right = 1;
exposed.down = 2;
exposed.left = 3;

exposed.flip = function(direction) {
	return common.implicit(direction+2);
};

exposed.getAxis = function(direction) {
	return !!((direction+1)%2);
};

exposed.getAxisAmplitude = function(direction) {
	direction = common.implicit(direction);
	
	if (exposed.isHorizontal(direction)) {
		switch (direction) {
			case 1: return 1;
			case 3: return -1;
		};
	} else {
		switch (direction) {
			case 0: return -1;
			case 2: return 1;
		};
	}
};

exposed.isHorizontal = function(direction) {
	return exposed.getAxis(direction) == false;
};

exposed.isVertical = function(direction) {
	return exposed.getAxis(direction) == true;
};

exposed.all = function() {
	return [exposed.up, exposed.right, exposed.down, exposed.left];
};

});
