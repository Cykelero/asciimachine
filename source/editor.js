
var Editor = (function() {

var common = {};

// Exposed
common.exposed = function(input, backgroundColor) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.input = input;
	internal.backgroundColor = backgroundColor || [0, 0, 0];
	internal.scale = 1;
	
	internal.renderTargets = null;
	internal.machineText = null;
	
	internal.width = null;
	internal.height = null;
	
	internal.machineEffects = null;
	internal.styleElement = null;
	internal.effectCanvas = null;
	internal.effectContext = null;
	
	internal.isRunning = false;
	internal.simulationMachine = null;
	internal.tickTimeout = null;
	
	internal.shiftKeyDown = false;
	
	// Exposed methods
	exposed.refreshDisplay = function() {
		if (internal.isRunning) return;
		
		var newText = internal.getInputText();
		
		if (newText != internal.machineText) {
			// Render machine
			internal.refreshDisplay(newText);
			
			internal.machineText = internal.getInputText();
		} else {
			internal.renderEffects();
		}
	};
	
	exposed.setMode = function(run) {
		run = !!run;
		
		internal.autoSave();
		
		if (internal.isRunning == run) return;
		internal.isRunning = run;
		
		internal.input.contentEditable = !run;
		
		var userSelect = run ? "none" : "";
		internal.input.style["-webkit-user-select"] = userSelect;
		internal.input.style["-khtml-user-select"] = userSelect;
		internal.input.style["-moz-user-select"] = userSelect;
		internal.input.style["-ms-user-select"] = userSelect;
		internal.input.style["user-select"] = userSelect;
		
		if (run) {
			// Start simulation
			// // Complete render targets
			internal.initializeRenderTargets(true);
			internal.generateMissingRenderTargets();
			
			// // Save caret position
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
			
			// // Create machine, schedule ticks
			internal.machineText = internal.getInputText();
			internal.simulationMachine = ASCIIMachine.newMachine(internal.machineText);
			
			var tick = function() {
				internal.simulationMachine.tick();
				internal.simulationMachine.renderTo(self);
				
				internal.tickTimeout = setTimeout(tick, common.internal.simulationRate);
			};
			
			tick();
			
			// // Enable interactivity
			internal.input.style.cursor = "pointer";
			internal.input.addEventListener("mousedown", internal.onMouseDown, false);
			
		} else {
			// Stop simulation
			// // Stop simulation interval
			clearTimeout(internal.tickTimeout);
			internal.tickTimeout = null;
			internal.simulationMachine = null;
			
			// // Rebuild display with original text
			internal.rebuildDisplay();
			internal.refreshDisplay(internal.machineText);
			
			// // Restore caret position
			var selectedRenderTarget = internal.getRenderTarget(internal.savedCaretPosition.x, internal.savedCaretPosition.y);
			
			if (selectedRenderTarget && selectedRenderTarget.element.parentNode) {
				var newRange = document.createRange();
				newRange.setStart(selectedRenderTarget.element, 1);
				newRange.setEnd(selectedRenderTarget.element, 1);
				
				var selectionObject = window.getSelection();
				selectionObject.removeAllRanges();
				selectionObject.addRange(newRange);
			}
			
			// // Disable interactivity
			internal.input.style.cursor = "";
			internal.input.removeEventListener("mousedown", internal.onMouseDown);
		}
		
		if (typeof(exposed.onModeChange) == "function") exposed.onModeChange(internal.isRunning);
	};
	
	exposed.toggleMode = function() {
		exposed.setMode(!internal.isRunning);
	};
	
	exposed.getMode = function() {
		return internal.isRunning;
	};
	
	exposed.setScale = function(newScale) {
		internal.scale = Math.abs(parseInt(newScale)) || 1;
		internal.renderEffects();
	};
	
	exposed.onModeChange = function(newMode) {
		
	};
	
	// // Machine rendering methods
	exposed.beginFrame = function(width, height) {
		internal.width = width;
		internal.height = height;
		
		internal.machineEffects = [];
		
		if (!internal.isRunning) {
			// In edition mode: initialize targets
			internal.initializeRenderTargets();
		} else {
			// In simulation mode: clear targets
			internal.renderTargets.forEach(function(column) {
				column.forEach(function(target) {
					target.depth = Number.POSITIVE_INFINITY;
					
					target.element.textContent = " ";
					target.element.style.backgroundColor = common.internal.color(internal.backgroundColor);
					target.drawnList = [];
				});
			});
		}
	};
	
	exposed.drawObject = function(info) {
		if (info.char == "") return;
		
		var renderTarget = internal.getRenderTarget(info.x, info.y);
		
		if (renderTarget) {
			var span = renderTarget.element;
			
			renderTarget.drawnList.push(info);
			renderTarget.drawnList.sort(function(a, b) {
				return (b.depth - a.depth);
			});
			
			// Background color
			var backgroundColor = internal.backgroundColor.concat();
			
			for (var i = 0 ; i < renderTarget.drawnList.length ; i++) {
				var depthInfo = renderTarget.drawnList[i];
				
				var depthColor = depthInfo.backgroundColor,
					opacity = depthColor[3],
					backgroundOpacity = 1 - opacity;
				
				backgroundColor[0] = Math.round(depthColor[0] * opacity + backgroundColor[0] * backgroundOpacity);
				backgroundColor[1] = Math.round(depthColor[1] * opacity + backgroundColor[1] * backgroundOpacity);
				backgroundColor[2] = Math.round(depthColor[2] * opacity + backgroundColor[2] * backgroundOpacity);
				backgroundColor[3] = opacity + backgroundColor[3] * backgroundOpacity;
			}
				
			span.style.backgroundColor = common.internal.color(backgroundColor);
			
			// Color and character
			if (info.depth <= renderTarget.depth) {
				renderTarget.depth = info.depth;
				
				span.style.color = common.internal.color(info.color);
				
				if (info.char == " ") info.char = " ";
				if (internal.isRunning) span.textContent = info.char;
			}
		}
	};
	
	exposed.drawEffect = function(effect) {
		internal.machineEffects.push(effect);
	};
	
	exposed.flushFrame = function() {
		internal.renderEffects();
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
		
		if (text[text.length-1] == "\n") text = text.slice(0, text.length-1);
		
		return text;
	}
	
	internal.autoSave = function() {
		if (!internal.isRunning) {
			localStorage["asciiMachineEditor-autosavedMachineHtml"] = internal.input.innerHTML;
		}
	}
	
	// // Rendering targets
	internal.initializeRenderTargets = function(prepareForRunMode) {
		// Reset targets
		internal.renderTargets = [];
		
		for (var x = 0 ; x < internal.width ; x++) {
			var column = internal.renderTargets[x] = [];
			for (var y = 0 ; y < internal.height ; y++) {
				var span = document.createElement("span");
				column[y] = {
					x: x,
					y: y,
					element: span,
					depth: Number.POSITIVE_INFINITY,
					drawnList: []
				};
			};
		};
		
		// Find & index characters
		var currentX = 0,
			currentY = 0,
			previousElementIsBr = false,
			previousElementIsDiv = false;
		
		function findLetters(element) {
			if (element != internal.input) {
				element.removeAttribute("style");
				element.removeAttribute("color"); // font elements…
			}
			
			// Search element for characters
			for (var i = 0 ; i < element.childNodes.length ; i++) {
				var node = element.childNodes[i];
				
				if (node.nodeType == 1) {
					// Preceded by a br?
					if (previousElementIsBr && (node.tagName == "BR" || node.tagName == "DIV" || node.textContent != "")) {
						previousElementIsBr = false;
						
						if (node.tagName != "DIV") {
							currentX = 0;
							currentY++;
						}
					}
					
					// Line-breaking div?
					if (node.tagName == "DIV" && !previousElementIsDiv) {
						if (currentX > 0 || currentY > 0) {
							// Following characters are on a new line
							currentX = 0;
							currentY++;
						}
					}
					
					// Search children as well
					findLetters(node);
					
					// Element-specific stuff
					if (node.tagName == "DIV") {
						if (prepareForRunMode) {
							// Preparing to run and div is empty: adding anchor renderTarget to allow completion
							if (node.textContent.length == 0 || node.textContent == "\n") {
								var firstLineTarget = internal.getRenderTarget(currentX, currentY);
								
								if (firstLineTarget) {
									var newTarget = document.createElement("span");
									node.insertBefore(newTarget, node.firstChild);
									firstLineTarget.element = newTarget;
								}
								
							}
						}
						
						// Ending br should be ignored
						previousElementIsBr = false;
						
						// Following characters are on a new line
						currentX = 0;
						currentY++;
					} else if (node.tagName == "BR") {
						// Following characters are on a new line, if we're not at the end of a div
						previousElementIsBr = true;
					}
					
					previousElementIsDiv = (node.tagName == "DIV");
					
				} else if (node.nodeType == 3) {
					// Text node
					var text = node.textContent,
						newSpans = [];
					
					if (text.length != 1 || element.tagName != "span") {
						// Split text content into spans
						for (var c = 0 ; c < text.length ; c++) {
							var char = text[c];
							
							var charSpan;
							if (char != "\n") {
								var renderTarget = internal.getRenderTarget(currentX, currentY);
								
								if (renderTarget) {
									charSpan = renderTarget.element;
									currentX++;
								} else {
									charSpan = document.createElement("span");
								}
							} else {
								charSpan = document.createElement("span");
							}
							
							charSpan.textContent = char;
							
							newSpans.push(charSpan);
						}
						
						// Replace the text node with the spans
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
			if (!internal.renderTargets[0][y].element.parentNode) continue; // pass empty lines
			
			for (var x = 0 ; x < internal.width ; x++) {;
				var renderSpan = internal.renderTargets[x][y].element;
				
				if (!renderSpan.parentNode) {
					var previousSpan = internal.renderTargets[x-1][y].element;
					previousSpan.parentNode.insertBefore(renderSpan, previousSpan.nextSibling);
					renderSpan.textContent = " ";
				}
			};
		};
	};
	
	internal.rebuildDisplay = function() {
		var text = internal.machineText.replace(/ /g, " "),
			lines = text.split("\n");
		
		internal.input.innerHTML = "";
		lines.forEach(function(line) {
			var div = document.createElement("div");
			div.innerText = line + "\n";
			internal.input.appendChild(div);
		});
	};
	
	// // User I/O
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
	
	internal.onMouseDown = function(event) {
		var renderElement = event.target;
		
		internal.renderTargets.forEach(function(column) {
			column.forEach(function(renderTarget) {
				var element = renderElement;
				
				do {
					if (renderTarget.element == element) {
						// This renderTarget has been clicked
						internal.simulationMachine.userAction(renderTarget.x, renderTarget.y);
					}
				} while (element = element.parentNode);
			});
		});
	};
	
	// // Other
	internal.renderEffects = function() {
		// Sizing
		// // Canvas size
		var inputStyle = getComputedStyle(internal.input);
		
		var canvasWidth = internal.input.clientWidth
			- parseInt(inputStyle.paddingLeft)
			- parseInt(inputStyle.paddingRight);
		
		var canvasHeight = internal.input.clientHeight
			- parseInt(inputStyle.paddingTop)
			- parseInt(inputStyle.paddingBottom);
		
		// // Individual character size
		var charWidth = canvasWidth/internal.width,
			charHeight = canvasHeight/internal.height;
		
		// Render
		internal.effectCanvas.width = canvasWidth;
		internal.effectCanvas.height = canvasHeight;
		
		var context = internal.effectContext;
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		
		internal.machineEffects.forEach(function(effect) {
			switch (effect.type) {
				case "line":
					// Color and width
					if (effect.color.length < 4) effect.color[3] = 1;
					context.strokeStyle = common.internal.color(effect.color);
					
					context.lineWidth = effect.width * internal.scale;
					
					// Path
					context.beginPath();
					
					effect.points.forEach(function(point, index) {
						context[index == 0 ? "moveTo" : "lineTo"]
							(point.x * charWidth, point.y * charHeight);
					});
					
					context.stroke();
				break;
			};
		});
		
		// Show rendered effects
		var renderDataUrl = internal.effectCanvas.toDataURL();
		
		internal.styleElement.innerHTML = "#" + internal.input.id + ":before {"
			+ "content: '';"
			+ "position: absolute;"
			+ "top: 0;"
			+ "right: 0;"
			+ "bottom: 0;"
			+ "left: 0;"
			+ "padding: inherit;"
			+ "pointer-events: none;"
			+ "background-image: url(" + renderDataUrl + ");"
			+ "background-origin: content-box;"
			+ "background-repeat: no-repeat;"
		+ "}";
	};
	
	// Init
	// // Prepare input element
	internal.input.contentEditable = true;
	internal.input.style.whiteSpace = "nowrap";
	
	// // Put initial text
	var machineHtml = localStorage["asciiMachineEditor-autosavedMachineHtml"];
	if (!machineHtml) {
		var cleanedHTML = internal.input.innerHTML.replace(/\n/g, "");
		cleanedHTML = cleanedHTML.replace(/(.*?)(<\s*br\s*\/?\s*>|$)/gi, "<div>$1</div>");
		cleanedHTML = cleanedHTML.replace(/<div><\/div>/g, "");
		machineHtml = cleanedHTML;
	}
	
	internal.input.innerHTML = machineHtml;
	
	// // Create effect rendering canvas
	internal.effectCanvas = document.createElement("canvas");
	internal.effectCanvas.style.position = "absolute";
	internal.effectCanvas.style.left = 0;
	internal.effectCanvas.style.top = 0;
	
	internal.effectCanvas.style.right = 0;
	internal.effectCanvas.style.bottom = 0;
	
	internal.effectCanvas.style.pointerEvents = "none";
	
	internal.effectContext = internal.effectCanvas.getContext("2d");
	
	if (!internal.input.id) throw new Error("The input element has no HTML id");
	internal.styleElement = document.createElement("style");
	internal.styleElement.type = "text/css";
	document.head.appendChild(internal.styleElement);
	
	// // Auto highlighting
	internal.input.addEventListener("keyup", function(event) {
		exposed.refreshDisplay();
	});
	
	exposed.refreshDisplay();
	setInterval(exposed.refreshDisplay, 1000/4);
	
	// // Autosave
	setInterval(function() {
		internal.autoSave();
	}, 1000);
	
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
				// Enter: help the browser add line breaks
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
	var colorArrayCopy = colorArray.concat();
	if (colorArrayCopy.length < 4) colorArrayCopy[3] = 1;
	
	return "rgba(" + colorArrayCopy.join() + ")";
};

common.internal.simulationRate = 1000/3;

return common.exposed;
})();