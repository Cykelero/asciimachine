// needs machineEntityTypesAggregator.js


// needs entityDefinitions/types/basic/X.js
// needs entityDefinitions/types/basic/slopes.js
// needs entityDefinitions/types/basic/air.js

// needs entityDefinitions/types/power/battery.js
// needs entityDefinitions/types/power/wires.js
// needs entityDefinitions/types/power/E.js
// needs entityDefinitions/types/power/userToggle.js
// needs entityDefinitions/types/power/XOR.js
// needs entityDefinitions/types/power/AND.js
// needs entityDefinitions/types/power/buttons.js
// needs entityDefinitions/types/power/i.js

// needs entityDefinitions/types/actuators/H.js
// needs entityDefinitions/types/actuators/conveyorWheels.js

// needs entityDefinitions/types/emitters/C.js
// needs entityDefinitions/types/emitters/Y.js
// needs entityDefinitions/types/emitters/F.js
// needs entityDefinitions/types/emitters/U.js

// needs entityDefinitions/types/mobile/O.js
// needs entityDefinitions/types/mobile/balloon.js
// needs entityDefinitions/types/mobile/water.js

// needs entityDefinitions/types/misc/arrows.js
// needs entityDefinitions/types/misc/pipes.js

// needs entityDefinitions/types/generated/crossedWires.js
// needs entityDefinitions/types/generated/conveyorBelt.js


var MachineEntityTypes = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

MachineEntityTypesAggregator.buildTypes();
exposed.types = MachineEntityTypesAggregator.types;

});
