/* SVP2.js 0.1 - Nathan Manceaux-Panot (@Cykelero) */
/* A library to write programs using the SVP2 pattern. */

var SVP2;

(function() {

/* svp2Class.js */

var SVP2Class = (function() {

var common = {};

// Exposed
common.exposed = function(defineList, isStatic) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.defineList = defineList.slice(0);
	internal.static = isStatic;
	
	// Exposed methods
	exposed.makeSubclass = function(define) {
		return new common.exposed(internal.defineList.concat(define), internal.static);
	};
	
	exposed.makeMixin = function(defines) {
		defines.forEach(function (define) {
			define.withPassthroughConstructor = true;
		});
		
		return new common.exposed(internal.defineList.concat(defines), internal.static);
	};
	
	exposed.getClass = function() {
		var returned,
			initializeInstance,
			constructors = [],
			surfaceConstructor;
		
		// Base
		if (!internal.static) {
			returned = function() {
				// SVP2 class
				// Access the `naked` property to get the actual constructor
				initializeInstance(this, arguments);
			};
		} else {
			returned = {};
		}
		
		// Applying definition functions
		var internalObject = {};
		var defineEnv = function(construct) {
			if (constructors[currentDefinitionLevel]) throw new Error("A constructor has already been defined.");
			
			constructors.push(construct);
			surfaceConstructor = construct;
		};
		defineEnv.__defineGetter__("class", function() {
			return returned;
		});
		
		for (var currentDefinitionLevel = 0 ; currentDefinitionLevel < internal.defineList.length ; currentDefinitionLevel++) {
			var defineFunction = internal.defineList[currentDefinitionLevel];
			defineFunction.call(defineEnv, {internal: internalObject, exposed: returned});
			
			var constructorFunction = constructors[currentDefinitionLevel];
			if (!constructorFunction) {
				// Adding a default pass-through constructor
				var standIn = function() {};
				standIn.isPassthrough = true;
				defineEnv(standIn);
			} else if (defineFunction.withPassthroughConstructor) {
				constructorFunction.isPassthrough = true;
			}
		}
		
		// Preparing instance construction
		var callConstructor = function(instance, instanceInternal, level, args) {
			var constructorFunction = constructors[level],
				parentCaller = null;
			
			if (level > 0) {
				parentCaller = function() {
					callConstructor(instance, instanceInternal, level-1, arguments);
					
					parentCaller.exposed = {};
					for (var p in instance) {
						var prop = instance[p];
						if (instance.hasOwnProperty(p) && typeof(prop) == "function") {
							parentCaller.exposed[p] = prop;
						}
					}
					
					parentCaller.internal = {};
					for (var p in instanceInternal) {
						var prop = instanceInternal[p];
						if (instanceInternal.hasOwnProperty(p) && typeof(prop) == "function") {
							parentCaller.internal[p] = prop;
						}
					}
				};
			}
			
			var constructorEnv = {
				exposed: instance,
				internal: instanceInternal,
				parent: parentCaller,
				expose: function(properties) {
					for (var p in properties) {
						if (properties.hasOwnProperty(p)) {
							var setter = properties[p];
							instance.__defineGetter__(p, (function(propertyName) {
								return function() {
									return instanceInternal[propertyName];
								}
							})(p));
							
							if (setter) {
								if (typeof(setter) != "function") {
									setter = (function(propertyName) {
										return function(value) {
											instanceInternal[propertyName] = value;
										}
									})(p);
								}
								instance.__defineSetter__(p, setter);
							}
						}
					}
				}
			};
				
			if (constructorFunction.isPassthrough) {
				parentCaller.apply(constructorEnv, args);
			}
			
			constructorFunction.apply(constructorEnv, args);
		};
		
		initializeInstance = function(instance, args) {
			callConstructor(instance, {}, constructors.length-1, args);
		};
		
		// Finalizing returned object
		returned._SVP2 = self;
		returned.__defineGetter__("naked", function() {
			return internal.defineList[internal.defineList.length-1];
		});
		
		return returned;
	};
	
	// Internal methods
	
	// Init
	
};

common.exposed.makeClass = function(define, isStatic) {
	return new common.exposed([define], isStatic);
};

// Internal
common.internal = {};

return common.exposed;
})();

/* Svp2.js */

SVP2 = (function() {

// Exposed
var exposed = {};

exposed.class = function(ancestor, define) {
	if (define) {
		// With ancestor
		return internal.makeSubclass(define, ancestor);
	} else {
		// No ancestor
		define = ancestor;
		return internal.makeClass(define, false);
	}
};

exposed.staticClass = function(define) {
	return internal.makeClass(define, true);
};

exposed.mixin = function(ancestor, defines) {
	if (typeof(defines) == "function") defines = [defines];
	return internal.makeMixin(defines, ancestor);
}

// Internal
var internal = {};

internal.makeClass = function(define, static) {
	return SVP2Class.makeClass(define, static).getClass();
};

internal.makeSubclass = function(define, ancestor) {
	return ancestor._SVP2.makeSubclass(define).getClass();
};

internal.makeMixin = function(defines, ancestor) {
	return ancestor._SVP2.makeMixin(defines).getClass();
};

return exposed;
})();

})();
