
var Editor = (function() {

var common = {};

// Exposed
common.exposed = function(input) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.input = input;
	internal.renderTargets = null;
	internal.machineText = null;
	
	internal.isRunning = false;
	
	internal.shiftKeyDown = false;
	
	// Exposed methods
	exposed.refreshDisplay = function() {
		if (internal.isRunning) return;
		
		var newText = internal.getInputText();
		
		if (newText != internal.machineText) {
			// Rendering machine
			internal.refreshDisplay(newText);
			
			// Re-reading text
			internal.machineText = internal.getInputText();
		}
	};
	
	exposed.setMode = function(run) {
		run = !!run;
		
		if (internal.isRunning == run) return;
		internal.isRunning = run;
		
		internal.input.contentEditable = !run;
		
		if (run) {
			// Starting simulation
			internal.machineText = internal.getInputText();
			var machine = ASCIIMachine.newMachine(internal.machineText);
			
			var tick = function() {
				if (internal.isRunning) {
					machine.tick();
					machine.renderTo(self);
					
					setTimeout(tick, common.internal.simulationRate);
				}
			};
			
			tick();
			
		} else {
			// Stopping simulation
			// // Reinserting original text
			var lines = internal.machineText.split("\n");
			
			internal.input.innerHTML = "";
			lines.forEach(function(line) {
				var div = document.createElement("div");
				div.innerText = line;
				internal.input.appendChild(div);
			});
			
			// // Coloring text
			internal.refreshDisplay(internal.machineText);
			
		}
	};
	
	exposed.toggleMode = function() {
		exposed.setMode(!internal.isRunning);
	};
	
	// // Machine rendering methods
	exposed.beginFrame = function(width, height) {
		// Preparing span array
		internal.initializeRenderTargets(width, height);
		
		// Finding letters, making them into spans
		var currentX = 0,
			currentY = 0;
		
		function findLetters(element) {
			element.removeAttribute("style");
			element.removeAttribute("color"); // font elements…
			
			// Searching element for letters, subelements
			for (var i = 0 ; i < element.childNodes.length ; i++) {
				var node = element.childNodes[i];
								
				if (node.nodeType == 1) {
					// Element
					findLetters(node);
					
					if (node.tagName == "DIV") {
						currentX = 0;
						currentY++;
					}
					
				} else if (node.nodeType == 3) {
					// Text node
					var text = node.textContent,
						newSpans = [];
					
					if (text.length != 1 || element.tagName != "span") {
						// Splitting text content as spans
						for (var c = 0 ; c < text.length ; c++) {
							var char = text[c];
							
							var charSpan;
							if (char != "\n") {
								charSpan = internal.getRenderTarget(currentX, currentY).element;
								currentX++;
							} else {
								charSpan = document.createElement("span");
							}
							
							charSpan.textContent = char;
							
							newSpans.push(charSpan);
						}
						
						// Replacing the text node with the spans
						newSpans.forEach(function(span) {
							element.insertBefore(span, node);
						});
						
						element.removeChild(node);
						
						i += (newSpans.length - 1);
					} else {
						// There is only a single character in this element: no need to create a new span
						if (text.length == 1 && text != "\n") {
							internal.getRenderTarget(currentX, currentY).element = element;
							currentX++;
						}
					}
				}
			}
		};
		
		findLetters(internal.input);
		
		// If simulation running: resetting characters and background colors
		if (internal.isRunning) {
			internal.renderTargets.forEach(function(column) {
				column.forEach(function(target) {
					target.element.textContent = " ";
					target.element.style.backgroundColor = "black";
				});
			});
		}
	};
	
	exposed.drawObject = function(info) {
		if (info.char == "") return;
		
		var renderTarget = internal.getRenderTarget(info.x, info.y);
		
		if (renderTarget) {
			// Depth handling
			if (renderTarget.depth < info.depth) return;
			renderTarget.depth = info.depth;
			
			// Coloring
			var span = renderTarget.element;
			span.style.color = common.internal.color(info.color);
			
			var backgroundColor = info.backgroundColor;
			if (backgroundColor[3] == 0) backgroundColor = [0, 0, 0, 1];
			span.style.backgroundColor = common.internal.color(backgroundColor);
			
			// Char setting
			if (internal.isRunning) span.textContent = info.char;
		}
	};
	
	exposed.flushFrame = function() {
		
	};
	
	// Internal methods
	// // Input element I/O
	internal.refreshDisplay = function(text) {
		var machine = ASCIIMachine.newMachine(text);
		machine.renderTo(self);
	};
	
	internal.getInputText = function() {
		var text = internal.input.innerText || internal.input.textContent;
		text = text.replace(/ /g, " ");
		return text;
	}
	
	// // Rendering targets
	internal.initializeRenderTargets = function(width, height) {
		internal.renderTargets = [];
		
		for (var x = 0 ; x < width ; x++) {
			var column = internal.renderTargets[x] = [];
			for (var y = 0 ; y < height ; y++) {
				var span = document.createElement("span");
				column[y] = {
					element: span,
					depth: Number.POSITIVE_INFINITY
				};
			};
		};
	};
	
	internal.getRenderTarget = function(x, y) {
		var column = internal.renderTargets[x];
		if (!column) return null;
		return column[y] || null;
	};
	
	// Init
	// // Preparing input
	internal.input.contentEditable = true;
	internal.input.innerHTML = internal.input.innerHTML.replace(/\n/g, "").replace(/(.*?)(<\s*br\s*\/?\s*>|$)/gi, "<div>$1</div>");
	
	// // Auto highlighting
	internal.input.addEventListener("keyup", function(event) {
		exposed.refreshDisplay();
	});
	
	exposed.refreshDisplay();
	setInterval(exposed.refreshDisplay, 1000/4);
	
	// // Shift+enter to run, esc to stop
	// // // Shift
	document.addEventListener("keydown", function(event) {
		if (event.keyCode == 16) {
			internal.shiftKeyDown = true;
		}
	});
	
	document.addEventListener("keyup", function(event) {
		if (event.keyCode == 16) {
			internal.shiftKeyDown = false;
		}
	});
	
	// // // Enter
	document.addEventListener("keydown", function(event) {
		if (event.keyCode == 13) {
			if (internal.shiftKeyDown) {
				exposed.setMode(true);
				return false;
			}
		}
	});
	
	// // // Esc
	document.addEventListener("keydown", function(event) {
		if (event.keyCode == 27) {
			if (internal.isRunning) {
				exposed.setMode(false);
				event.preventDefault();
				return false;
			}
		}
	});
};

// Internal
common.internal = {};

common.internal.color = function(colorArray) {
	return "rgba(" + colorArray.join() + ")";
};

common.internal.simulationRate = 1000/4;

return common.exposed;
})();

