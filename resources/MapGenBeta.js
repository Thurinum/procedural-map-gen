//BE SURE TO FLUSH CELLS BG PRIOR RELAUCHING!!!

"use strict";

//**//VERSION//**//
const versionx = "Version 1.0";

//Greeting message
console.info(`[Welcome] Tile Map Generator - ${versionx}`);
document.getElementById("version").innerHTML = versionx;

//**//GLOBAL VARIABLES//**//
var tileReference;			// Dynamic object containing current cell's data
var gridSize;				// Size of the grid (e.g. 25)
var gridSide;				// Size of on side of the grid (e.g. 5)
var nullLeftArray = [];		// Used to fix left cell detection
var nullRightArray = [];	// Used to fix right cell detection
var errorStatus = false;	// Abort if an error occurs
var generatedCells = 0;		// Number of cells generated
var texDistribution;		// Distribution of textures

//**//GENERATE WORLD//**//
//Note: size argument MUST be a square number!!! (16,25,144,etc.)
function generateWorld(size) {
	//**//INITIALIZE GENERATION//**//
	//Log start message
	console.log("=============== MAP GENERATION LOG ===============");

	//Generate grid
	var grid = document.getElementById("grid");
	var cellsCount = 1;

	//Reset grid and error status
	errorStatus = false;
	generatedCells = 0;

	//Enable Dev Mode if needed
	if (ui_enableCellSelection) {
		dev_enableCellSelection();
	}

	//Get absolute grid dimensions
	gridSize = size;
	gridSide = Math.sqrt(gridSize);

	sideWidth = grid.offsetWidth;
	cellWidth = sideWidth / gridSide;

	//Log info on console
	console.info(`[Info] World grid generated:\n\nSize: ${gridSide}x${gridSide}\nTiles to render: ${gridSize}`);

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

	//Randomly generate first tile (out of 4 possibilities)
	var random = Math.random();
	if (random <= 0.25) {
		gen_createReferenceTile(1);
		console.info(`[Info] First reference tile set as ${1}.`);
	} else if (random <= 0.5) {
		gen_createReferenceTile(gridSide);
		console.info(`[Info] First reference tile set as ${gridSide}.`);
	} else if (random <= 0.75) {
		gen_createReferenceTile(gridSize - gridSide + 1);
		console.info(`[Info] First reference tile set as ${gridSize - gridSide + 1}.`);
	} else if (random <= 1) {
		gen_createReferenceTile(gridSize);
		console.info(`[Info] First reference tile set as ${gridSize}.`);
	}

	//Set iterations count
	var iterations = 0;

	//Render the 24 tiles left
	while (iterations <= gridSize) {
		if (errorStatus) {
			console.exception("[Error] Generation aborted due to an error.");
			return false;
		} else {
			createNewTile();
			iterations++;
		}
	}

	if (errorStatus === false) {
		console.info(`[Success] Map rendered successfully.`);
	}
}

var tileInfo = [];
//**//FUNCTIONS ADJUVANTS//**//
//Generates the properties of a tile to render
function gen_createReferenceTile(positionArray) {
	var temp = {
		//Position info
		//id: id,
		master: positionArray,
		top: [positionArray[0], positionArray[1] + cellWidth],
		bottom: [positionArray[0], positionArray[1] - cellWidth],
		left: [positionArray[0] - cellWidth, positionArray[1]],
		right: [positionArray[0] + cellWidth, positionArray[1]],

		getTexture(tile) {
			var tempTex = tileReference[tile];

			if (tileReference[tile]) {
				tempTex = tileReference[tile].textureInfo;
			} else if (!tileReference[tile]) {
				tempTex = "void";
			}

			if (tempTex === "undefined" || tempTex === "") {
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

			return top + bottom + left + right;
		},

		//Changes texture of a specific tile
		setTexture(src) {
			if (tileReference.master) {
				canvas.clear(tileReference.master);
				canvas.setTexture(tileReference.master, src);
				tileReference.master.textureInfo = src;
			}
		}
	}

	//Fixes left and right cell detection for tileReference properties
	if (temp.left) {
		if (nullLeftArray.includes(temp.left.id.slice(4))) {
			temp.left = null;
		}
	}
	if (temp.right) {
		if (nullRightArray.includes(temp.right.id.slice(4))) {
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

	if (debug_showExtendedLogs) {
		console.info(`[Info] Non-empty directions: ${directions}.`)
	}

	for (i = 0; i < cellsArray.length; i++) {
		for (var a = 0; a < directions.length; a++) {
			if (tiles[cellsArray[i]][directions[a]].includes(tileReference.getTexture(directions[a]))) {
			} else {
				valid = false;
			}
		}

		if (valid === true) {
			posArray.push(cellsArray[i]);
			if (debug_showExtendedLogs) {
				console.info(`[Info] Checking texture "${cellsArray[i]}"... VALID`);
			}
		} else if (valid === false) {
			if (debug_showExtendedLogs) {
				console.info(`[Info] Checking texture "${cellsArray[i]}"... INVALID`);
			}
			valid = true;
		}
	}

	if (debug_showExtendedLogs) {
		console.info(`[Info] Found ${posArray.length} suitable textures.`);
	}

	var result = randomTexture(posArray);
	return result;
}

//Picks randomly a texture from the input array using provided probabilities
function randomTexture(textures) {
	var output;
	var texLength = textures.length;

	/*TEXTURE SELECTION MODES
	RANDOM
	True randomness, each texture has the same chance of being chosen. Repartition between land and water on the map will be mostly equal.

	LAND
	Increases the probabilites for a "land" texture to be used on the map.

	WATER
	Increases the probabilites for a "water" texture to be used on the map.
	/*/

	//Basic function, returns equiprobable results
	function basicRandom(tex) {
		var random = Math.random();
		var base = 1;
		var increment = 1 / tex.length;
		var choice;

		for (var i = 0; i < tex.length; i++) {
			if (random <= base) {
				choice = tex[i];
			}
			base -= increment;
		}

		return choice;
	}

	if (texDistribution === 0) {
		output = basicRandom(textures);
	} else if (parseInt(texDistribution) < 0) {
		if (textures.includes("land")) {
			if (textures.length !== 1) {
				var multiple = parseInt(texDistribution.toString().slice(1)) * texLength;
				console.log(multiple)
				var content = [];
				for (let a = 0; a < multiple; a++) {
					content.push(`land`);
				}

				textures = textures.concat(content);
			}
		}

		output = basicRandom(textures);
	} else if (parseInt(texDistribution) > 0) {
		if (textures.includes("water")) {
			if (textures.length !== 1) {
				console.log(textures)
				var multiple = texDistribution * texLength;
				var content = [];
				for (let a = 0; a < multiple; a++) {
					content.push(`water`);
				}

				textures = textures.concat(content);
				console.log(content)
			}
		}

		output = basicRandom(textures);
	}

	if (debug_showExtendedLogs) {
		console.info(`[Info] Random texture selection returned ${output}.\n       Texture Distribution: ${texDistribution}`);
	}

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
		if (debug_showExtendedLogs) {
			console.info(`[Info] Map is empty, generating first texture randomly.`);
		}
		if (generatedCells === 0) {
			texture = randomTexture(cellsArray);
		} else {
			texture = randomTexture(cellsArray);
		}
	} else {
		if (debug_showExtendedLogs) {
			console.info(`[Info] Detecting suitable textures for tile #${generatedCells + 1}`);
		}
		texture = matchTextures();
	}

	//Dev flag, for test purposes only
	if (engine_singleTileMap) {
		texture = engine_singleTileMapTex;
		console.warn(`[DevMode] Using single texture map: ${engine_singleTileMapTex}`);
	}

	//Check validity of texture
	if (!cellsArray.includes(texture)) {
		//Abort
		console.warn(`[Warning] Invalid texture "${texture}" for tile #${tileReference.id}.`);
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
			console.warn(`[Warning] Unknown textures categories combination "${tileReference.getAdjacentTexturesCategories()}"`);
			break;
	}

	generatedCells++;

	console.info(`[Info] Applied texture "${texture}" to tile #${oldTileReference.id}\n       Next target is tile #${tileReference.id}`);
	if (debug_showExtendedLogs) {
		console.info(`[Info] Total rendered cells: ${generatedCells}`);
	}
}

//**//START MAP GENERATION EVENT//**//
document.getElementById("generator").addEventListener("click", function () {
	var size = document.getElementById("number").value;
	texDistribution = parseInt(document.getElementById("slider").value);
	generateWorld(size);
}); 
