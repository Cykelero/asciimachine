// needs machineEntity.js
// needs direction.js

var MachineEntityTypesAggregator = SVP2.staticClass(function(common) {

// Exposed
var exposed = common.exposed;

exposed.defineAttribute = function(name, definitionFunction) {
	var attributeMixin = definitionFunction(internal.attributes, exposed.types);
	attributeMixin.attributeName = name;
	internal.attributes[name] = attributeMixin;
};

exposed.defineType = function(name, definitionFunction) {
	internal.types[name] = definitionFunction(internal.attributes, exposed.types);
};

exposed.types = {};

exposed.buildTypes = function() {
	for (var t in internal.types) {
		if (internal.types.hasOwnProperty(t)) {
			exposed.types[t] = internal.buildType(internal.types[t]);
		}
	};
}

// Internal
var internal = common.internal;

internal.attributes = {};
internal.types = {};

internal.buildType = function(mixin) {
	var defines = [],
		attributes = [];
	
	var addToDefines = function(define) {
		if (typeof(define) == "function") {
			if (defines.indexOf(define) == -1) defines.push(define);
		} else {
			define.forEach(function(subDefine) {
				addToDefines(subDefine);
			});
			
			var attributeName = define.attributeName;
			if (attributeName && attributes.indexOf(attributeName) == -1)  attributes.push(attributeName);
		}
	};
	addToDefines(mixin);
	
	var builtClass = SVP2.mixin(MachineEntity, defines);
	for (var i = 0 ; i < attributes.length ; i++) {
		builtClass.setHasAttribute(attributes[i], true);
	}
	return builtClass;
};

});
