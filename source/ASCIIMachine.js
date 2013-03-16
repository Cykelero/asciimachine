// provides ASCIIMachine

// needs machine.js

ASCIIMachine = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

exposed.newMachine = function(machineText) {
	return new Machine(machineText);
};

// Internal
var internal = common.internal;

});
