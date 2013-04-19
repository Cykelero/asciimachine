
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
	internal.tickTimeout = null;
	
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
			// // Completing render targets
			internal.initializeRenderTargets(true);
			internal.generateMissingRenderTargets();
			
			// // Saving caret position
			var selectedRenderTarget = internal.getSelectionPosition();
			
			if (selectedRenderTarget) {
				internal.savedCaretPosition = {
					x: selectedRenderTarget.x,
					y: selectedRenderTarget.y
				};
			} else {
				internal.savedCaretPosition = {
					x: 0,
					y: 0
				};
			}
			
			// // Creating machine, scheduling ticks
			internal.machineText = internal.getInputText();
			var machine = ASCIIMachine.newMachine(internal.machineText);
			
			var tick = function() {
				machine.tick();
				machine.renderTo(self);
				
				internal.tickTimeout = setTimeout(tick, common.internal.simulationRate);
			};
			
			tick();
			
		} else {
			// Stopping simulation
			// // Stopping tick
			clearTimeout(internal.tickTimeout);
			internal.tickTimeout = null;
			
			// // Reinserting original text
			var text = internal.machineText.replace(/ /g, " "),
				lines = text.split("\n");
			
			internal.input.innerHTML = "";
			lines.forEach(function(line) {
				var div = document.createElement("div");
				div.innerText = line + "\n";
				internal.input.appendChild(div);
			});
			
			// // Coloring text
			internal.refreshDisplay(internal.machineText);
			
			// // Restoring caret position
			var selectedRenderTarget = internal.getRenderTarget(internal.savedCaretPosition.x, internal.savedCaretPosition.y);
			
			if (selectedRenderTarget && selectedRenderTarget.element.parentNode) {
				var newRange = document.createRange();
				newRange.setStart(selectedRenderTarget.element, 1);
				newRange.setEnd(selectedRenderTarget.element, 1);
				
				var selectionObject = window.getSelection();
				selectionObject.removeAllRanges();
				selectionObject.addRange(newRange);
			}
			
		}
	};
	
	exposed.toggleMode = function() {
		exposed.setMode(!internal.isRunning);
	};
	
	exposed.getMode = function() {
		return internal.isRunning;
	};
	
	// // Machine rendering methods
	exposed.beginFrame = function(width, height) {
		internal.width = width;
		internal.height = height;
		
		// If simulation not running: resetting render targets
		if (!internal.isRunning) {
			internal.initializeRenderTargets();
		}
				
		// If simulation running: resetting renderTargets
		if (internal.isRunning) {
			internal.renderTargets.forEach(function(column) {
				column.forEach(function(target) {
					target.depth = Number.POSITIVE_INFINITY;
					
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
			if (info.char == " ") info.char = " ";
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
	internal.initializeRenderTargets = function(prepareForRunMode) {
		// Resetting targets
		internal.renderTargets = [];
		
		for (var x = 0 ; x < internal.width ; x++) {
			var column = internal.renderTargets[x] = [];
			for (var y = 0 ; y < internal.height ; y++) {
				var span = document.createElement("span");
				column[y] = {
					x: x,
					y: y,
					element: span,
					depth: Number.POSITIVE_INFINITY
				};
			};
		};
		
		// Finding letters, making them into indexed spans
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
						// If preparing to run and div is empty, adding anchor renderTarget
						if (prepareForRunMode) {
							if (node.textContent.length == 0 || node.textContent == "\n") {
								var firstLineTarget = internal.getRenderTarget(currentX, currentY);
								
								if (firstLineTarget) {
									var newTarget = document.createElement("span");
									node.insertBefore(newTarget, node.firstChild);
									firstLineTarget.element = newTarget;
								}
								
							}
						}
						
						// Following characters are on a new line
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
	};
	
	internal.getRenderTarget = function(x, y) {
		var column = internal.renderTargets[x];
		if (!column) return null;
		return column[y] || null;
	};
	
	internal.generateMissingRenderTargets = function() {
		for (var y = 0 ; y < internal.height ; y++) {
			if (!internal.renderTargets[0][y].element.parentNode) continue; // passing empty lines for now
			
			for (var x = 0 ; x < internal.width ; x++) {;
				var renderSpan = internal.renderTargets[x][y].element;
				
				if (!renderSpan.parentNode) {
					var previousSpan = internal.renderTargets[x-1][y].element;
					previousSpan.parentNode.insertBefore(renderSpan, previousSpan.nextSibling);
				}
			};
		};
	};
	
	// // Other
	internal.getSelectionPosition = function() {
		function searchBackwards(element, searchDown, searchUp) {
			// Is the element a renderTarget?
			var renderTargetObject = null;
			internal.renderTargets.some(function(colum) {
				return colum.some(function(renderTarget) {
					if (renderTarget.element == element) {
						// Found!
						renderTargetObject = renderTarget;
						return true;
					}
				});
			});
			
			if (renderTargetObject) return renderTargetObject;
			
			// No. Any of its children?
			var lastChild = element.lastChild;
			if (searchDown && lastChild) {
				var result = searchBackwards(lastChild, true, false);
				if (result) return result;
			}
			
			// No. Its preceding sibling, or parent?
			var preceding = element.previousSibling;
			
			if (preceding) {
				var result = searchBackwards(preceding, true, searchUp);
				if (result) return result;
			} else {
				if (searchUp && element.parentNode) {
					var result = searchBackwards(element.parentNode, false, true);
					if (result) return result;
				}
			}
			
			return null;
		};
		
		var selectionObject = window.getSelection();
		if (selectionObject.rangeCount > 0) {
			var range = selectionObject.getRangeAt(0);
			var container = range.startContainer;
			var element = container.childNodes[range.startOffset] || container;
			
			return searchBackwards(element, true, true);
		} else {
			return null;
		}
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
				// Shift + enter: running
				exposed.setMode(true);
				return false;
			} else {
				// Enter: helping the browser add line breaks
				var selectionObject = window.getSelection();
				if (selectionObject.rangeCount > 0) {
					var range = selectionObject.getRangeAt(0);
					var element = range.startContainer;
					
					if (element.nodeType == 1) {
						// Not a text node
						var targetNode = document.createTextNode("");
						range.insertNode(targetNode);
						
						var newRange = document.createRange();
						newRange.setStart(targetNode, 0);
						newRange.setEnd(targetNode, 0);
						selectionObject.removeAllRanges();
						selectionObject.addRange(newRange);
					}
				}
			}
		}
	});
	
	// // // Esc
	document.addEventListener("keydown", function(event) {
		if (event.keyCode == 27 || event.keyCode == 8) {
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