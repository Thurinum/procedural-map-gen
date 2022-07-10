//**//DEV FLAGS//**//
const engine_singleTileMap = false;		// Forces render of the map with a single cell
const engine_singleTileMapTex = "land";	// Texture used by engine_singleTileMap
const engine_useExperimental = false;	// Use experimental features (at your own risk)
const debug_loggingLevel = 3;			// 0: Don't generate logs. 1: Generate basic logs. 2: Generate detailed logs. 3: Generate full logs.
const ui_autoRender = true;				// Auto render on any setting update

var DevModeEnabledFeatures = [];		// Don't touch

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

window.onerror = function () {
	debug_newLogEntry(`Script error detected, see console for details.`, 1, 2);
};

window.onkeypress = function (e) {
	if (e.keyCode === 32) {
		debug_generateLogs(false);
	} else if (e.keyCode === 13) {
		debug_generateLogs(true);
	}
}

//Auto-mode
if (ui_autoRender) {
	document.getElementById("quality").oninput = function () {
		var size = Math.pow(document.getElementById("number").value, 2);
		engine_renderWorld(size);
	}
	document.getElementById("number").addEventListener("input", function() {
		var size = Math.pow(document.getElementById("number").value, 2);
		engine_renderWorld(size);
	});

	document.getElementById("usePerspective").oninput = function () {
		var size = Math.pow(document.getElementById("number").value, 2);
		engine_renderWorld(size);
	}

	document.getElementById("generator").addEventListener("click", function () {
		var size = Math.pow(document.getElementById("number").value, 2);
		engine_renderWorld(size);
	});

	document.querySelector("#menu-toggle").onclick = (e) => {
		document.querySelector("#userPanel").classList.toggle("visible");
		e.currentTarget.classList.toggle("toggled");
	}

	let doAnim = document.querySelector("#useFloatingAnim");
	doAnim.onchange = (e) => {
		document.querySelector("#canvas").style.animation = doAnim.checked ? "float 3s ease-in-out infinite" : "none";
	}
	
	window.onload = function () {
		var size = Math.pow(document.getElementById("number").value, 2);
		engine_renderWorld(size);
	}

	DevModeEnabledFeatures.push(` Auto Render`);
}

function validateProbabilities() {
	let probabilities = probabilitiesSet;
	var sum = 0;
	for (var i = 0; i < probabilities.length; i++) {
		if (probabilities[i][0] === 0) {
			debug_newLogEntry(`Probabilities null for '${probabilities[i][1]}', texture will not be used.`, 1, 1);
		}
		sum += probabilities[i][0];
	}
	
	if (sum !== 100) {
		if (sum >= 99 && sum <= 101) {
			debug_newLogEntry(`Unaccurate textures probabilities sum with an error margin of ${100 - sum}%.`, 1, 1);
		} else {
			debug_newLogEntry(`Invalid textures probabilities sum of ${sum}% (must be ~100).`, 1, 3);
			document.querySelector("#probabilities-validation").innerText = "Invalid probabilities sum " + sum + ". Must be ~100.";
			return false;
		}
	}

	document.querySelector("#probabilities-validation").innerText = "Looks good.";
}

// //Enable probabilities sliders
// let sliders = document.querySelectorAll(`.probability-slider`);
// for (let i = 0; i < sliders.length; i++) {
// 	let slider = sliders[i];
// 	probabilitiesSet[i][0] = parseFloat(slider.value);

// 	slider.addEventListener("input", function(e) {
// 		probabilitiesSet[i][0] = parseFloat(e.target.value);
// 		//var size = Math.pow(document.getElementById("number").value, 2);
// 		validateProbabilities();
// 		//engine_renderWorld(size);
// 	});
// };

if (DevModeEnabledFeatures.length > 0) {
	console.info(`[DevMode] The following Dev Mode features are enabled:\n\n${DevModeEnabledFeatures}`);
}