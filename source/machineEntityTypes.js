// needs machineEntityTypesAggregator.js


// needs entityDefinitions/attributes/solid.js
// needs entityDefinitions/attributes/fixed.js
// needs entityDefinitions/attributes/hasArrows.js
// needs entityDefinitions/attributes/powerNode.js
// needs entityDefinitions/attributes/conductor.js
// needs entityDefinitions/attributes/wire.js
// needs entityDefinitions/attributes/crossedWire.js
// needs entityDefinitions/attributes/arrow.js
// needs entityDefinitions/attributes/gravity.js
// needs entityDefinitions/attributes/antiGravity.js


// needs entityDefinitions/types/basic/X.js
// needs entityDefinitions/types/basic/air.js

// needs entityDefinitions/types/power/battery.js
// needs entityDefinitions/types/power/wires.js
// needs entityDefinitions/types/power/userToggle.js
// needs entityDefinitions/types/power/XOR.js
// needs entityDefinitions/types/power/H.js

// needs entityDefinitions/types/mobile/O.js

// needs entityDefinitions/types/misc/arrows.js

// needs entityDefinitions/types/generated/crossedWires.js


var MachineEntityTypes = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

MachineEntityTypesAggregator.buildTypes();
exposed.types = MachineEntityTypesAggregator.types;

});
