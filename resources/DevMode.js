//**//DEV FLAGS//**//
const engine_singleTileMap = false;		// Forces render of the map with a single cell
const engine_singleTileMapTex = "land";	// Texture used by engine_singleTileMap
const engine_useExperimental = false;	// Use experimental features (at your own risk)
const debug_loggingLevel = 3;			// 0: Don't generate logs. 1: Generate basic logs. 2: Generate detailed logs. 3: Generate full logs.
const ui_autoRender = true;				// Auto render on any setting update

var DevModeEnabledFeatures = [];		// Don't touch

//**//EXPERIMENTAL FEATURES//**//
if (engine_useExperimental) {
	
}

//**//DEV TOOLS//**//
var selectedCell;
var selectTex = document.getElementById("dev_changeTex");

//Show extended logs
if (debug_loggingLevel > 0) {
	console.warn(`[Warning] Logging is enabled to level ${debug_loggingLevel}. How to use:\n\ndebug_generateLogs(false): View logs on current page.\ndebug_generateLogs(true): Download logs as .html.`);

	DevModeEnabledFeatures.push(`Logging Level ${debug_loggingLevel}`);
} else {
	console.info(`[Info] Extended logs are *disabled*. Enable in DevMode.js for debugging.\nType 'debug_help()' for help.`);
}

var infoLogContent = ``;	// Debug log content (must be activated in DevMode.js)
var infoLogID = 1;

//Generated debug logs
function debug_generateLogs(download) {
	if (debug_loggingLevel === 0) {
		infoLogContent = "Logging is not enabled. You can enable it in DevMode.js."
	}

	if (download === true) {
		//Auto-download info log
		var link = document.createElement('a');
		link.setAttribute('href', `data:text/html;charset=utf-8,` + encodeURIComponent(debugLogFileStart + infoLogContent + `</body></html>`));
		link.setAttribute('download', "debugLog" + infoLogID + ".xlog");

		link.style.display = 'none';
		document.body.appendChild(link);

		link.click();
		document.body.removeChild(link);

		infoLogID++;
	} else {
		//Overwrite document with info log
		var win = window.open();
		console.log(win)

		win.document.body.innerHTML = `<!DOCTYPE html><html><head><title>Debug Log</title><style>${styleSheet}</style></head><body>` + infoLogContent + `</body></html>`;
	}

	console.info(`HOW TO USE\n==========\n\n- Click on an entry for more info.\n- There are 3 warning levels in DevMode.js\n- Click on spoilers to reveal more info`);
}

function debug_newLogEntry(value, minimum, type, tooltip) {
	/*
		GENERATE LOG ENTRY
		==================
		value: String message
		minimum: Minimum error level to take log into account (max. 3)
		type: Log flag type (max 3, or custom string)
	*/

	if (debug_loggingLevel >= minimum) {
		var flag = ``;
		var tooltipContent = ``;

		if (tooltip !== undefined) {
			tooltipContent = `onmouseenter="this.style.color = '#19ff9e';" onmouseleave="this.style.color = 'white'" onclick="alert('${infoLogTooltips[tooltip]}')"`;
		}

		switch (type) {
			case -2:
				flag = `<span ${tooltipContent} style='color:#00ea00;'>[Success] `;
				break;
			case -1:
				flag = `${tooltipContent}`;
				break;
			case 0:
				flag = `<span ${tooltipContent} >[Info] `;
				break;
			case 1:
				flag = `<span ${tooltipContent} style='color:#cece1a;'>[Warning] `;
				break;
			case 2:
				flag = `<span ${tooltipContent} style='color:orangered;'>[Error] `;
				break;
			case 3:
				flag = `<span ${tooltipContent} style='color:red;'>[Fatal] `;
				break;
			default:
				flag = `<span>[${type}] `;
				break;
		}

		if (flag === "[undefined] ") {
			flag = "<span style='color:cyan'>${tooltipContent}[Unflagged Log] </span>";
		}

		infoLogContent += flag + value + "</span>\n";
	}
}

window.onerror = function() {
	debug_newLogEntry(`Script error detected, see console for details.`, 1, 2);
};

window.onkeypress = function(e) {
	if (e.keyCode === 32) {
		debug_generateLogs(false);
	} else if (e.keyCode === 13) {
		debug_generateLogs(true);
	}
}

//Auto-mode
if (ui_autoRender) {
	document.getElementById("quality").oninput = function() {
		var size = document.getElementById("number").value;
		engine_renderWorld(size);
	}
	document.getElementById("number").oninput = function() {
		var size = document.getElementById("number").value;
		engine_renderWorld(size);
	}

	document.getElementById("usePerspective").oninput = function() {
		var size = document.getElementById("number").value;
		engine_renderWorld(size);
	}

	document.getElementById("generator").addEventListener("click", function() {
		var size = document.getElementById("number").value;
		engine_renderWorld(size);
	});

	window.onload = function() {
		var size = document.getElementById("number").value;
		engine_renderWorld(size);
	}

	DevModeEnabledFeatures.push(` Auto Render`);
}

// //Enable probabilities sliders
// for (let i = 0; i < 18; i++) {
// 	var slider = document.getElementById("slider" + (i + 1));
// 	slider.addEventListener("input", function(e) {
// 		sliders(i, e);
// 	});
// };

// function sliders(n, event) {
// 	probabilities[n][0] = parseInt(event.target.value);
// 	console.log(probabilities)
// 	var size = document.getElementById("number").value;
// 	engine_renderWorld(size);
// }

if (DevModeEnabledFeatures.length > 0) {
	console.info(`[DevMode] The following Dev Mode features are enabled:\n\n${DevModeEnabledFeatures}`);
}