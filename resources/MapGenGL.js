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
	clear: function(target) {
		target.getContext("2d").clearRect(0, 0, target.width, target.height);
	},
	setTexture: function(target, src, x, y) {
		var texture = new Image();
		texture.src = `resources/textures/${src}.png`;
		texture.width = cellWidth;
		texture.height = cellWidth;
		texturePreloadDiv.append(texture);

		var width = target.width;
		var height = target.height;

		//Texture must be appended to div or it won't display correctly
		target.getContext("2d").drawImage(texture, x, y, width / gridSide, height / gridSide);
	}
}