const cellsArray = ["land", "water", "coastT", "coastB", "coastL", "coastR", "coastTL1", "coastTL2", "coastTR1", "coastTR2", "coastBL1", "coastBL2", "coastBR1", "coastBR2", "coastD1", "coastD2", "coastD11", "coastD21"];

const tiles = {
	land: {
		top: ["land", "coastB", "coastBL1", "coastBR1"],
		bottom: ["land", "coastT", "coastTL1", "coastTR1"],
		left: ["coastR", "coastTR1", "coastBR1", "land"],
		right: ["land", "coastL", "coastTL1", "coastBL1"],
		probability: 5.55
	},
	water: {
		top: ["water", "coastT", "coastBL2", "coastBR2"],
		bottom: ["water", "coastB", "coastTR2", "coastTL2"],
		left: ["water", "coastL", "coastTR2", "coastBR2"],
		right: ["water", "coastR", "coastTL2", "coastBL2"],
		probability: 5.55
	},
	coastT: {
		top: ["land", "coastB", "coastBL1", "coastBR1"],
		bottom: ["water", "coastB", "coastTL2", "coastTR2"],
		left: ["coastT", "coastTL1", "coastBL2", "coastD2", "coastD11"],
		right: ["coastT", "coastTR1", "coastBR2", "coastD1", "coastD21"],
		probability: 5.55
	},
	coastB: {
		top: ["water", "coastT", "coastBL2", "coastBR2"],
		bottom: ["land", "coastT", "coastTL1", "coastTR1"],
		left: ["coastB", "coastTL2", "coastBL1", "coastD1", "coastD21"],
		right: ["coastB", "coastTR2", "coastBR1", "coastD2", "coastD11"],
		probability: 5.55
	},
	coastL: {
		top: ["coastL", "coastTL1", "coastTR2", "coastD2", "coastD11"],
		bottom: ["coastL", "coastBL1", "coastBR2", "coastD1", "coastD21"],
		left: ["coastR", "coastTR1", "coastBR1", "land"],
		right: ["water", "coastR", "coastTL2", "coastBL2"],
		probability: 5.55
	},
	coastR: {
		top: ["coastR", "coastTL2", "coastTR1", "coastD1", "coastD21"],
		bottom: ["coastR", "coastBL2", "coastBR1", "coastD2", "coastD11"],
		left: ["water", "coastL", "coastTR2", "coastBR2"],
		right: ["land", "coastL", "coastTL1", "coastBL1"],
		probability: 5.55
	},
	coastTL1: {
		top: ["land", "coastB", "coastBL1", "coastBR1"],
		bottom: ["coastL", "coastBL1", "coastBR2", "coastD1", "coastD21"],
		left: ["land", "coastR", "coastTR1", "coastBR1"],
		right: ["coastT", "coastTR1", "coastBR2", "coastD1", "coastD21"],
		probability: 5.55
	},
	coastTL2: {
		top: ["water", "coastT", "coastBL2", "coastBR2"],
		bottom: ["coastR", "coastBL2", "coastBR1", "coastD2", "coastD11"],
		left: ["water", "coastL", "coastTR2", "coastBR2"],
		right: ["coastB", "coastTR2", "coastBR1", "coastD2", "coastD11"],
		probability: 5.55
	},
	coastTR1: {
		top: ["land", "coastB", "coastBL1", "coastBR1"],
		bottom: ["coastR", "coastBL2", "coastBR1", "coastD2", "coastD11"],
		left: ["coastT", "coastTL1", "coastBL2", "coastD2", "coastD11"],
		right: ["land", "coastL", "coastTL1", "coastBL1"],
		probability: 5.55
	},
	coastTR2: {
		top: ["coastT", "water", "coastBL2", "coastBR2"],
		bottom: ["coastL", "coastBL1", "coastBR2", "coastD1", "coastD21"],
		left: ["coastB", "coastTL2", "coastBL1", "coastD1", "coastD21"],
		right: ["water", "coastR", "coastTL2", "coastBL2"],
		probability: 5.55
	},
	coastBL1: {
		top: ["coastL", "coastTL1", "coastTR2", "coastD2", "coastD11"],
		bottom: ["land", "coastT", "coastTL1", "coastTR1"],
		left: ["land", "coastR", "coastTR1", "coastBR1"],
		right: ["coastB", "coastTR2", "coastBR1", "coastD2", "coastD11"],
		probability: 5.55
	},
	coastBL2: {
		top: ["coastR", "coastTL2", "coastTR1", "coastD1", "coastD21"],
		bottom: ["water", "coastB", "coastTL2", "coastTR2"],
		left: ["water", "coastL", "coastTR2", "coastBR2"],
		right: ["coastT", "coastTR1", "coastBR2", "coastD1", "coastD21"],
		probability: 5.55
	},
	coastBR1: {
		top: ["coastR", "coastTL2", "coastTR1", "coastD1", "coastD21"],
		bottom: ["land", "coastT", "coastTL1", "coastTR1"],
		left: ["coastB", "coastTL2", "coastBL1", "coastD1", "coastD21"],
		right: ["land", "coastL", "coastTL1", "coastBL1"],
		probability: 5.55
	},
	coastBR2: {
		top: ["coastL", "coastTL1", "coastTR2", "coastD2", "coastD11"],
		bottom: ["water", "coastB", "coastTL2", "coastTR2"],
		left: ["coastT", "coastTL1", "coastBL2", "coastD2", "coastD11"],
		right: ["water", "coastR", "coastTL2", "coastBL2"],
		probability: 5.55
	},
	coastD2: {
		top: ["coastR", "coastTL2", "coastTR1", "coastD1", "coastD21"],
		bottom: ["coastL", "coastBL1", "coastBR2", "coastD1", "coastD21"],
		left: ["coastB", "coastTL2", "coastBL1", "coastD1", "coastD21"],
		right: ["coastT", "coastTR1", "coastBR2", "coastD1", "coastD21"],
		probability: 5.55
	},
	coastD1: {
		top: ["coastL", "coastTL1", "coastTR2", "coastD2", "coastD11"],
		bottom: ["coastR", "coastBL2", "coastBR1", "coastD2", "coastD11"],
		left: ["coastT", "coastTL1", "coastBL2", "coastD2", "coastD11"],
		right: ["coastB", "coastTR2", "coastBR1", "coastD2", "coastD11"],
		probability: 5.55
	},
	coastD11: {
		top: ["coastR", "coastTL2", "coastTR1", "coastD1", "coastD21"],
		bottom: ["coastL", "coastBL1", "coastBR2", "coastD1", "coastD21"],
		left: ["coastB", "coastTL2", "coastBL1", "coastD1", "coastD21"],
		right: ["coastT", "coastTR1", "coastBR2", "coastD1", "coastD21"],
		probability: 5.55
	},
	coastD21: {
		top: ["coastL", "coastTL1", "coastTR2", "coastD2", "coastD11"],
		bottom: ["coastR", "coastBL2", "coastBR1", "coastD2", "coastD11"],
		left: ["coastT", "coastTL1", "coastBL2", "coastD2", "coastD11"],
		right: ["coastB", "coastTR2", "coastBR1", "coastD2", "coastD11"],
		probability: 5.55
	},
}

var probabilitiesSet = [
	[5.55, "land"],
	[5.55, "water"],
	[5.55, "coastT"],
	[5.55, "coastB"],
	[5.55, "coastL"],
	[5.55, "coastR"],
	[5.55, "coastTL1"],
	[5.55, "coastTL2"],
	[5.55, "coastTR1"],
	[5.55, "coastTR2"],
	[5.55, "coastBL1"],
	[5.55, "coastBL2"],
	[5.55, "coastBR1"],
	[5.55, "coastBR2"],
	[5.55, "coastD1"],
	[5.55, "coastD2"],
	[5.55, "coastD11"],
	[5.55, "coastD21"],
];

const styleSheet = `
    body {
	  background-color: black;
	  color: #DDDDDD;
	  white-space: pre-wrap;
	  overflow-wrap: anywhere; 
	  font-size: 19px;
	  font-family: monospace;
    }
    details {
	  display: inline;
	  color: #6a73a2;
    }
    img {
	  width: 24x;
	  height: 24px;
    }
    span {
	  display: flex;
	  margin-bottom: -10px;
	  transition: color 0.3s linear;
    }
`
const debugLogFileStart = `
    <!DOCTYPE html>
    <html>
	  <head>
	    <title>Dynamic Tile Map Generator Debug Log</title>
	    <meta charset="utf-8" />
	    <style>
		body {
		    background-color: black;
		    color: #DDDDDD;
		    white-space: pre-wrap;
		    overflow-wrap: anywhere; 
		    font-size: 19px;
		    font-family: sans-serif;
		}
		details {
		    display: inline;
		    color: #6a73a2;
		}
		img {
		    width: 24x;
		    height: 24px;
		}
		span {
		    display: flex;
		}
	    </style>
	  </head>
	  <body>`;

const infoLogTooltips = {
	1: 'GRID SIZE: Size of the grid used for computing tiles position (in cells).TILES TO RENDER: Amount of tiles to renderABSOLUTE TILE SIZE: Size (in pixels) of a single tile of the gridCANVAS RESOLUTION: Resolution of the HTML canvas used for computations.RENDERING ENGINE: Indicates whether the generator uses HTML canvas or WebGL for rendering.USE PERSPECTIVE: Indicates the use of axonometric (orthogonal) perspective.',
}