// needs machineEntityTypes.js

// needs powerNetwork.js

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
	if (entityClass) {
		entity = new entityClass(parent, char, cell);
	} else {
		throw(new Error("Unknown entity type: "+char));
	}
	
	return entity;
};

// Internal
var internal = common.internal;

});
