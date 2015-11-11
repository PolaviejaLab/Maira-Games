/** @module Alien **/
"use strict";

/**
 * @class
 * @classdesc Represents box of available sprites for use in Editor
 */
function SpriteBox(element, editor, spriteTable)
{
	this.element = document.getElementById(element);
	this.images = [];


	/**
	 * Mark the specified image as selected
	 *
	 * @param {Image} target - Target <img> element
	 */
	this.select = function(target)
	{
		for(var i = 0; i < spriteTable.length; i++) {
			if(this.images[i] == target) {
				var key = spriteTable[i].key;
				this.images[i].setAttribute("class", "selected");
				editor.setSprite(key);
			} else {
				this.images[i].setAttribute("class", "sprite");
			}
		}
	};


	var currentKey = spriteTable[0].key & 0xFF00;
	var insertBreaks = false;
	for(var i = 0; i < spriteTable.length; i++) {

		// Insert breaks when the first element of key changes.
		if(insertBreaks && currentKey != spriteTable[i].key & 0xFF00) {
			var br = document.createElement("br");
			this.element.appendChild(br);
			currentKey = spriteTable[i].key[0];
		}

		this.images[i] = document.createElement("img");
		var src = spriteTable[i].src;

		if ('frames' in spriteTable[i])
			src += '_1';

		this.images[i].src = 'tiles/' + src + '.png';
		this.images[i].setAttribute("class", "sprite");

		this.images[i].onclick = function(e) {
			this.select(e.target);
		}.bind(this);

		// Do not show if toolbox is set to false
		if('toolbox' in spriteTable[i] && spriteTable[i].toolbox === false)
			continue;

		this.element.appendChild(this.images[i]);
	}
}
