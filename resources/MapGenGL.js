//**//SUMMARY//**//
/*
	MapGenGL.js - Graphics engine for Dynamic Tile Map Generator, by Maxime Gagnon.

	MODES
	=====
	HTML5: Uses HTML canvas.
	WEBGL: Uses WebGL JavaScript API.
*/

var texturePreloadDiv = document.getElementById("texturesPreload");

//**//CANVAS FUNCTIONS//**//
const canvas = {
	clear: function (target) {
		target.getContext("2d").clearRect(0, 0, target.width, target.height);
	},
	setTexture: function (target, src, x, y) {
		var texture = new Image();
		texture.src = `resources/textures/${src}.jpg`;
		texture.width = cellWidth;
		texture.height = cellWidth;
		texturePreloadDiv.append(texture);

		var width = target.width;
		var height = target.height;

		//Texture must be appended to div or it won't display correctly
		target.getContext("2d").drawImage(texture, x, y, width / gridSide, height / gridSide);
	},

	// NOTE: FOR THIS TO WORK ON A LOCAL REPO YOU MUST USE A LOCAL WEB SERVER! (e.g. Web Server for Chrome extension)
	download: function (hq) {
		let format = hq ? "png" : "jpg"; // doesnt work for some reason lol

		let canvas = document.querySelector("#canvas");

		let image = canvas.toDataURL(`image/${format}`).replace(`image/${format}`, "image/octet-stream");
		var link = document.createElement('a');
		link.download = `tiled_map.${format}`;
		link.href = image;
		link.click();
	}
}