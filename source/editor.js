
var Editor = (function() {

var common = {};

// Exposed
common.exposed = function(input) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.input = input;
	internal.renderingSpans = null;
	internal.machineText = null;
	
	// Exposed methods
	exposed.refreshDisplay = function() {
		var newText = internal.getInputText();
		
		if (newText != internal.machineText) {
			// Rendering machine
			internal.refreshDisplay(newText);
			
			// Re-reading text
			internal.machineText = internal.getInputText();
		}
	};
	
	// // Machine rendering methods
	exposed.beginFrame = function(width, height) {
		// Preparing span array
		internal.renderingSpans = [];
		
		for (var x = 0 ; x < width ; x++) {
			var column = internal.renderingSpans[x] = [];
			for (var y = 0 ; y < height ; y++) {
				var span = document.createElement("span");
				column[y] = {
					element: span,
					depth: Number.POSITIVE_INFINITY
				};
			};
		};
		
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
					if (node.tagName == "BR" || node.tagName == "DIV") {
						currentX = 0;
						currentY++;
					}
					
					findLetters(node);
					
				} else if (node.nodeType == 3) {
					// Text node
					var text = node.textContent,
						newSpans = [];
					
					if (element.textContent.length != 1) {
						// Splitting text content as spans
						for (var c = 0 ; c < text.length ; c++) {
							var char = text[c];
							
							var charSpan;
							if (char != "\n") {
								charSpan = internal.renderingSpans[currentX][currentY].element;
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
							internal.renderingSpans[currentX][currentY].element = element;
							currentX++;
						}
					}
				}
			}
		};
		
		findLetters(internal.input);
	};
	
	exposed.drawObject = function(info) {
		if (info.char == "" || info.char == " ") return;
		
		var renderTarget = internal.renderingSpans[info.x][info.y];
		
		if (renderTarget.depth < info.depth) return;
		renderTarget.depth = info.depth;
		
		var span = renderTarget.element;
		span.style.color = common.internal.color(info.color);
		span.style.backgroundColor = common.internal.color(info.backgroundColor);
	};
	
	exposed.flushFrame = function() {
		
	};
	
	// Internal methods
	internal.refreshDisplay = function(text) {
		var machine = ASCIIMachine.newMachine(text);
		machine.tick();
		machine.renderTo(self);
	};
	
	internal.getInputText = function() {
		var text = internal.input.innerText || internal.input.textContent;
		text = text.replace(/ /g, " ");
		return text;
	}
	
	// Init
	internal.input.addEventListener("keyup", function(event) {
		exposed.refreshDisplay();
	});
	
	//setInterval(exposed.refreshDisplay, 1000/4);
	
	exposed.refreshDisplay();
};

// Internal
common.internal = {};

common.internal.color = function(colorArray) {
	return "rgba(" + colorArray.join() + ")";
};

return common.exposed;
})();

