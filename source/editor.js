
var Editor = (function() {

var common = {};

// Exposed
common.exposed = function(input) {
	var exposed = this;
	var internal = {};
	var self = this;
	
	internal.input = input;
	internal.machineText = null;
	internal.renderingSpans = null;
	
	// Exposed methods
	exposed.refreshDisplay = function() {
		var newText = internal.getInputText();
		
		if (newText != internal.machineText) {
			// Finding selection position
			var selection = null;
			
			var selectionObject = window.getSelection();
			if (selectionObject.rangeCount > 0) {
				var range = selectionObject.getRangeAt(0);
				
				// Is the selection in the output element?
				var isInside = false;
				
				var element = range.startContainer;
				while (element) {
					if (element == internal.input) {
						isInside = true;
						break;
					}
					element = element.parentNode;
				}
				
				if (isInside) {
					// Absolutely.
					selection = {
						start: null,
						length: range.toString().length
					};
					
					var ridiculousMarker = "<<<TEXT-SELECTION-BEGIN-BLEEP-BLOOP>>>";
					range.insertNode(document.createTextNode(ridiculousMarker));
					var textWithRidiculousPositionMarker = internal.getInputText();
					
					selection.start = textWithRidiculousPositionMarker.indexOf(ridiculousMarker);
				}
			}
			
			// Rendering machine
			internal.refreshDisplay(newText);
			
			// Applying selection back
			if (selection) {
				var newRange = document.createRange();
				newRange.setStart(input, selection.start);
				newRange.setEnd(input, selection.start+selection.length);
				selectionObject.removeAllRanges();
				selectionObject.addRange(newRange);
			}
			
			// Re-reading text
			internal.machineText = internal.getInputText();
		}
	};
	
	// // Render methods
	exposed.beginFrame = function(width, height) {
		internal.renderingSpans = [];
		
		for (var x = 0 ; x < width ; x++) {
			var column = internal.renderingSpans[x] = [];
			for (var y = 0 ; y < height ; y++) {
				var span = document.createElement("span");
				column[y] = span;
			};
		};
	};
	
	exposed.drawObject = function(info) {
		if (info.char == "") return;
		
		var span = internal.renderingSpans[info.x][info.y];
		span.innerText = span.textContent = info.char;
		span.style.color = common.internal.color(info.color);
		span.style.backgroundColor = common.internal.color(info.backgroundColor);
	};
	
	exposed.flushFrame = function() {
		var height = internal.renderingSpans[0] && internal.renderingSpans[0].length || 0,
			width = internal.renderingSpans.length;
		
		console.log(height+", "+width);
		
		internal.input.innerHTML = "";
		for (var y = 0 ; y < height ; y++) {
			for (var x = 0 ; x < width ; x++) {
				internal.input.appendChild(internal.renderingSpans[x][y]);
			};
			internal.input.appendChild(document.createElement("br"));
			console.log("hm");
		};
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