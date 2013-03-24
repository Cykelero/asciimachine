// needs machineEntityTypes.js

var MachineEntityFactory = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

exposed.makeEntity = function(getOtherChar, parent, char, cell) {
	var entityClass,
		entity;
	
	// Choosing class
	if (false && someSpecialCase) {
		
	} else {
		entityClass = MachineEntityTypes.types[char];
	}
	
	// Creating entity
	if (!entityClass) entityClass = MachineEntityTypes.types["X"];
	
	entity = new entityClass(parent, char, cell);
	
	return entity;
};

// Internal
var internal = common.internal;

});
