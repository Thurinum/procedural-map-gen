"use strict";

//**//VERSION//**//
const versionx = "0.9.x";

//Greeting message
console.info(`[Welcome] Tile Map Generator - ${versionx}`);
document.getElementById("version").innerHTML = versionx;

//**//GLOBAL VARIABLES//**//
var tileReference;			// Dynamic object containing current cell's data
var gridSize;				// Size of the grid (e.g. 25)
var gridSide;				// Size of on side of the grid (e.g. 5)
var sideWidth;				// Width in pixels of one side of the grid
var cellWidth;				// Width in pixels of one cell
var nullLeftArray = [];		// Used to fix left cell detection
var nullRightArray = [];	// Used to fix right cell detection
var errorStatus = false;	// Abort if an error occurs
var generatedCells = 0;		// Number of cells generated
var texDistribution;		// Distribution of textures
var quality;				// Canvas resolution
var usePerspective;			// Use axonometric perpective
var drawOverlay = document.getElementById("canvas");	// Canvas for drawing
var positionMultiplier = 1;	// Fixes texture position for current quality


//**//GENERATE WORLD//**//
//Note: size argument MUST be a square number!!! (16,25,144,etc.)
function engine_renderWorld(size) {
	infoLogContent = ``;

	//**//INITIALIZE GENERATION//**//
	debug_newLogEntry(`Welcome to Dynamic Tile Map Generator v.${versionx}.`, 0, 0);

	//Validate grid size
	if (Math.sqrt(size).toString().includes(".")) {
		if (size.toString().includes(".")) {
			debug_newLogEntry(`Invalid grid size '${size}': must not be a float number.`, 1, 3);
			return false;
		} else {
			debug_newLogEntry(`Invalid grid size '${size}': not a square number.`, 1, 3);
			return false;
		}
	} else if (size < 1) {
		debug_newLogEntry(`Invalid grid size '${size}': must not be null or negative.`, 1, 3);
		return false;
	}

	let probabilities = [
		...probabilitiesSet
	];
	
	//Validate texture probabilities
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
			return false;
		}
	}

	//Sort probabilities from lowest to highest
	probabilities.sort();

	//Generate grid
	var grid = document.getElementById("grid");
	var cellsCount = 1;

	//Reset grid and error status
	grid.innerHTML = ``;
	errorStatus = false;
	generatedCells = 0;
	quality = document.getElementById("quality").value;
	usePerspective = document.getElementById("usePerspective").checked;
	nullLeftArray = [];
	nullRightArray = [];

	//Set grid CSS style
	grid.style.gridTemplateRows = `repeat(${Math.sqrt(size)}, auto)`;
	grid.style.gridTemplateColumns = `repeat(${Math.sqrt(size)}, auto)`;

	//Generate cells
	while (cellsCount <= size) {
		var cell = document.createElement("div");
		cell.setAttribute("class", "cell");
		cell.setAttribute("id", "cell" + cellsCount);
		cell.textureInfo = "void";
		grid.append(cell);
		cellsCount++;
	}

	//Set canvas resolution
	drawOverlay.width = quality * 32;
	drawOverlay.height = quality * 32;

	positionMultiplier = drawOverlay.width / grid.offsetWidth;

	//Use perpective if enabled
	if (usePerspective) {
		drawOverlay.style.transform = "rotateX(-55deg) rotateZ(-45deg) translate(27%, -97%)";
	} else {
		drawOverlay.style.transform = "translate(-50%, -50%)";
	}

	//Get absolute grid dimensions
	gridSize = size;
	gridSide = Math.sqrt(gridSize);

	sideWidth = grid.offsetWidth;
	cellWidth = sideWidth / gridSide;

	//Log info on console
	debug_newLogEntry(`Generated tile grid:\n    Grid size: ${gridSide}x${gridSide}\n    Tiles to render: ${gridSize}\n    Absolute tile size: ~${(grid.offsetWidth / gridSide).toFixed(2)}px\n    Canvas resolution: ${quality * 32}x${quality * 32}px\n    Use perspective: ${usePerspective}`, 1, 0, 1);

	debug_newLogEntry(`<details><summary>Textures selection probabilities</summary>${probabilities}</details>`, 3, 0);

	//Generate null left/right data (for tileRef generation)
	var ini = 0;
	var ini2 = gridSide;

	for (var i = 0; i < gridSide; i++) {
		nullLeftArray.push(ini.toString());
		ini += gridSide;
	}

	for (var i = 0; i < gridSide; i++) {
		nullRightArray.push((ini2 + 1).toString());
		ini2 += gridSide;
	}

	debug_newLogEntry(`Following cells will be omitted for left/right cell detection:\n    Left: ${nullLeftArray}\n    Right: ${nullRightArray}`, 3, 0);

	//Randomly generate first tile (out of 4 possibilities)
	var random = Math.random();
	if (random <= 0.25) {
		gen_createReferenceTile(1);
		debug_newLogEntry(`First reference tile set as ${1}.`, 1, 0);
	} else if (random <= 0.5) {
		gen_createReferenceTile(gridSide);
		debug_newLogEntry(`First reference tile set as ${gridSide}.`, 1, 0);
	} else if (random <= 0.75) {
		gen_createReferenceTile(gridSize - gridSide + 1);
		debug_newLogEntry(`First reference tile set as ${gridSize - gridSide + 1}.`, 1, 0);
	} else if (random <= 1) {
		gen_createReferenceTile(gridSize);
		debug_newLogEntry(`First reference tile set as ${gridSize}.`, 1, 0);
	}

	//Set iterations count
	var iterations = 0;

	//Render the 24 tiles left
	while (iterations < gridSize) {
		if (errorStatus === true) {
			debug_newLogEntry("Generation aborted due to an error.", 1, 3);
			break;
		} else {
			debug_newLogEntry(`<hr><div style="text-align:center">Tile ${generatedCells + 1} (cell ${tileReference.id})</div><hr>`, 1, -1);
			createNewTile();
			iterations++;
		}
	}

	if (errorStatus === false) {
		debug_newLogEntry(`Map rendered successfully.`, 1, -2);
	}
}

//**//FUNCTIONS ADJUVANTS//**//
//Generates the properties of a tile to render
function gen_createReferenceTile(id) {
	var temp = {
		//Position info
		id: id,
		master: document.getElementById("cell" + id),
		top: document.getElementById("cell" + (id - gridSide)),
		bottom: document.getElementById("cell" + (id + gridSide)),
		left: document.getElementById("cell" + (id - 1)),
		right: document.getElementById("cell" + (id + 1)),

		getTexture(tile) {
			var tempTex = tileReference[tile];

			if (tileReference[tile]) {
				tempTex = tileReference[tile].textureInfo;
			} else if (!tileReference[tile]) {
				tempTex = "void";
			}

			if (tempTex === "undefined" || tempTex === "") {
				debug_newLogEntry(`Unset or undefined texture for cell #${tileReference.id}: ${tempTex}`, 3, 1);
				tempTex = "void";
			}

			return tempTex;
		},

		//Returns textures of all tiles around a specific tile
		getAdjacentTextures() {
			var top = tileReference.getTexture("top");
			var bottom = tileReference.getTexture("bottom");
			var left = tileReference.getTexture("left");
			var right = tileReference.getTexture("right");

			if (top === null) {
				top = "void";
			}
			if (bottom === null) {
				bottom = "void";
			}
			if (left === null) {
				left = "void";
			}
			if (right === null) {
				right = "void";
			}

			debug_newLogEntry(`Adjacent textures: ${top} ${bottom} ${left} ${right}.`, 3, 0);
			return top + bottom + left + right;
		},

		//Returns texture category of all tiles around a specific one
		getAdjacentTexturesCategories() {
			if (tileReference.top) {
				if (tileReference.getTexture("top") !== "void") {
					var top = "tex";
				} else {
					var top = "void";
				}
			} else {
				var top = "null";
			}

			if (tileReference.bottom) {
				if (tileReference.getTexture("bottom") !== "void") {
					var bottom = "tex";
				} else {
					var bottom = "void";
				}
			} else {
				var bottom = "null";
			}

			if (tileReference.left) {
				if (tileReference.getTexture("left") !== "void") {
					var left = "tex";
				} else {
					var left = "void";
				}
			} else {
				var left = "null";
			}

			if (tileReference.right) {
				if (tileReference.getTexture("right") !== "void") {
					var right = "tex";
				} else {
					var right = "void";
				}
			} else {
				var right = "null";
			}

			debug_newLogEntry(`Adjacent textures <em>categories</em>: ${top} ${bottom} ${left} ${right}.`, 3, 0);
			return top + bottom + left + right;
		},

		//Changes texture of a specific tile
		setTexture(src) {
			if (tileReference.master) {
				var a = tileReference.master.offsetLeft * positionMultiplier;
				var b = tileReference.master.offsetTop * positionMultiplier;
				//canvas.clear(tileReference.master);
				canvas.setTexture(drawOverlay, src, a, b)
				tileReference.master.textureInfo = src;

				debug_newLogEntry(`Applying texture '${src}.png':\n    X offset: ~${a.toFixed(2)} px\n    Y offset: ~${b.toFixed(2)} px`, 3, 0);
			}
		}
	}

	//Fixes left and right cell detection for tileReference properties
	if (temp.left) {
		if (nullLeftArray.includes(temp.left.id.slice(4))) {
			debug_newLogEntry(`Omitting #${temp.left.id} in compliance with <em>nullLeftArray</em>.`, 3, 0);
			temp.left = null;
		}
	}
	if (temp.right) {
		if (nullRightArray.includes(temp.right.id.slice(4))) {
			debug_newLogEntry(`Omitting #${temp.right.id} in compliance with <em>nullRightArray</em>.`, 3, 0);
			temp.right = null;
		}
	}

	tileReference = temp;
}

//Return the textures that match in the context
function matchTextures() {
	var c = 0;
	var i = 0;

	var initialDirections = ["top", "bottom", "left", "right"];
	var directions = [];
	var valid = true;
	var posArray = [];

	for (c = 0; c < initialDirections.length; c++) {
		if (tileReference.getTexture(initialDirections[c]) !== "void") {
			directions.push(initialDirections[c]);
		}
	}

	debug_newLogEntry(`Available non-null directions: ${directions}.`, 3, 0);

	for (i = 0; i < cellsArray.length; i++) {
		for (var a = 0; a < directions.length; a++) {
			if (tiles[cellsArray[i]][directions[a]].includes(tileReference.getTexture(directions[a]))) {
			} else {
				valid = false;
			}
		}

		if (valid === true) {
			posArray.push(cellsArray[i]);
		} else if (valid === false) {
			valid = true;
		}
	}

	debug_newLogEntry(`Detected ${posArray.length} suitable textures.`, 2, 0);
	debug_newLogEntry(`<details><summary>Current textures set for probabilities</summary>${posArray}</details>`, 3, 0);

	var result = randomTexture(posArray);

	if (result === undefined) {
		debug_newLogEntry(`Selected texture is undefined.`, 1, 1);
	}
	return result;
}

//Picks randomly a texture from the input array using provided probabilities
function randomTexture(textures) {
	var done = false;
	var loopVar = 0;
	var output;

	let probabilities = [
		...probabilitiesSet
	].sort();

	while (!done) {
		var random = Math.random();
		if (random < probabilities[loopVar][0] / 100) {
			if (textures.includes(probabilities[loopVar][1])) {
				output = probabilities[loopVar][1];
				done = true;
			}
		}
		if (loopVar === probabilities.length - 1) {
			loopVar = 0;
		} else {
			loopVar++;
		}
	}

	debug_newLogEntry(`Random texture selection returned '${output}'.`, 3, 0);
	return output;
}

//Sets the texture of the current tile reference
function createNewTile() {
	//Get current tileReference for monitoring purposes
	var oldTileReference = tileReference;

	//Declare texture variable
	var texture;

	//Get properties of adjacent tiles to tile reference
	var adjacentOutput = tileReference.getAdjacentTextures();

	//Set new tile texture based on adjacent tiles 
	if (adjacentOutput === "voidvoidvoidvoid") {
		debug_newLogEntry(`Detected empty map, generating first texture randomly.`, 2, 0);
		texture = randomTexture(cellsArray);
	} else {
		debug_newLogEntry(`Detected non-empty map, matching available textures.`, 3, 0);
		texture = matchTextures();
	}

	//Dev flag, for test purposes only
	if (engine_singleTileMap) {
		texture = engine_singleTileMapTex;
		debug_newLogEntry(`Using single texture map: ${engine_singleTileMapTex}`, 1, "DevMode");
	}

	//Check validity of texture
	if (!cellsArray.includes(texture)) {
		//Abort
		debug_newLogEntry(`Cannot bind texture "${texture}".`, 1, 2);
		errorStatus = true;
	} else {
		//Apply new tile texture
		tileReference.setTexture(texture);
	}

	//Determine which tile will be next to be generated
	//First cell is 1
	switch (tileReference.getAdjacentTexturesCategories()) {
		case "nullvoidnullvoid":
			gen_createReferenceTile(parseInt(tileReference.right.id.slice(4)))
			break;
		case "nullvoidtexvoid":
			gen_createReferenceTile(parseInt(tileReference.right.id.slice(4)))
			break;
		case "nullvoidtexnull":
			gen_createReferenceTile(parseInt(tileReference.bottom.id.slice(4)))
			break;
		case "texvoidvoidnull":
			gen_createReferenceTile(parseInt(tileReference.bottom.id.slice(4)))
			break;
		case "texnullvoidnull":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;
		case "voidnullvoidtex":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;
		case "voidnullnulltex":
			gen_createReferenceTile(parseInt(tileReference.top.id.slice(4)))
			break;
		case "voidtexnullvoid":
			gen_createReferenceTile(parseInt(tileReference.top.id.slice(4)))
			break;
		case "textexnullvoid":
			gen_createReferenceTile(parseInt(tileReference.right.id.slice(4)))
			break;
		case "texvoidtexvoid":
			gen_createReferenceTile(parseInt(tileReference.right.id.slice(4)))
			break;
		case "texvoidtextex":
			gen_createReferenceTile(parseInt(tileReference.bottom.id.slice(4)))
			break;
		case "texvoidvoidtex":
			gen_createReferenceTile(parseInt(tileReference.bottom.id.slice(4)))
			break;
		case "textexvoidtex":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;
		case "voidtexvoidtex":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;
		case "voidtextextex":
			gen_createReferenceTile(parseInt(tileReference.top.id.slice(4)))
			break;
		case "textextexvoid":
			gen_createReferenceTile(parseInt(tileReference.right.id.slice(4)))
			break;

		//First cell is 4
		case "voidvoidvoidtex":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;

		//First cell is 5
		case "nullvoidvoidnull":
			gen_createReferenceTile(parseInt(tileReference.bottom.id.slice(4)))
			break;
		case "nullvoidtextex":
			gen_createReferenceTile(parseInt(tileReference.bottom.id.slice(4)))
			break;
		case "voidtextexvoid":
			gen_createReferenceTile(parseInt(tileReference.top.id.slice(4)))
			break;

		//First cell is 21
		case "voidnullnullvoid":
			gen_createReferenceTile(parseInt(tileReference.top.id.slice(4)))
			break;
		case "voidnulltextex":
			gen_createReferenceTile(parseInt(tileReference.top.id.slice(4)))
			break;

		//First cell is 25
		case "nulltexnullvoid":
			gen_createReferenceTile(parseInt(tileReference.right.id.slice(4)))
			break;
		case "voidnullvoidnull":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;
		case "textexvoidnull":
			gen_createReferenceTile(parseInt(tileReference.left.id.slice(4)))
			break;

		case "textextextex":
			gen_createReferenceTile(parseInt(tileReference.master.id.slice(4)))
			break;

		default:
			debug_newLogEntry(`Unknown textures categories combination "${tileReference.getAdjacentTexturesCategories()}"`, 1, 1);
			break;
	}

	generatedCells++;

	debug_newLogEntry(`Applied texture "${texture}" to cell #${oldTileReference.id}`, 2, 0);
	if (gridSize - generatedCells === 0) {
		debug_newLogEntry(`Next target: cell #${tileReference.id}`, 3, 0);
		debug_newLogEntry(`Tiles to render left: ${gridSize - generatedCells}`, 2, 0);
	} else {
		debug_newLogEntry(`No cells left to render.`, 2, 0);
	}
}