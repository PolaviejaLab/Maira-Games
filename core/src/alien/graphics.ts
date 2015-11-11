/** @module Alien **/
"use strict";


/**
 * Create a new sprite manager object.
 *
 * @class
 * @classdesc Manages sprites in the alien girl game.
 */
function SpriteManager()
{
	this.sprites = {};
	var imageMap = {};

	/**
	 * Returns whether a given sprite is valid.
	 *
	 * @param {String} name - Name of the sprite to check
	 * @return {boolean} True if valid, false if not
	 */
	this.isSpriteValid = function(name)
	{
		return (name in this.sprites);
	}


	/**
	 * Draw a sprite to the context
	 *
	 * @param {Context} context - Context to draw to
	 * @param {Object} box - Bounding box {x, y, width, height} to draw to
	 * @param {String} name - Name of the sprite to draw
	 * @param {number} frame - Number of the frame to draw
	 * @param {Function} transform - Special transform function to call before drawing
	 */
	this.drawSprite = function(context, box, name, frame, transform)
	{
		var sprite = this.sprites[name];

		if(!sprite)
			throw new Error("Could not find sprite " + name + " " + name.toString(16));

		if(frame in sprite)
			sprite = sprite[frame];

		if(transform) {
			context.save();
			context.translate(box.x + box.width / 2, box.y + box.height / 2);

			transform(context);

			context.drawImage(sprite, -box.width / 2, -box.height / 2, box.width, box.height);
			context.restore();
		} else {
			context.drawImage(sprite, box.x, box.y, box.width, box.height);
		}
	}
}


SpriteManager.prototype.getFrameCount = function(sprite)
{
	if(!(sprite in this.sprites))
		return;

	return this.sprites[sprite].length;
}


/**
 * Returns the width of a sprite.
 *
 * @param {number} sprite - Number of the sprite.
 * @returns {number} Width in pixels.
 */
SpriteManager.prototype.getWidth = function(sprite)
{
	if(!(sprite in this.sprites))
		return;

	if(this.sprites[sprite].length > 1)
		return this.sprites[sprite][0].width;
	return this.sprites[sprite].width;
}


/**
 * Returns the height of a sprite.
 *
 * @param {number} sprite - Number of the sprite.
 * @returns {number} Height in pixels.
 */
SpriteManager.prototype.getHeight = function(sprite)
{
	if(!(sprite in this.sprites))
		return;

	if(this.sprites[sprite].length > 1)
		return this.sprites[sprite][0].height;
	return this.sprites[sprite].height;
}


SpriteManager.prototype.loadImage = function(key, frame, source)
{
	return new Promise(function(resolve, reject) {
		// Create array for frame if it does not already exist
		if(!(key in this.sprites))
			this.sprites[key] = [];

		this.sprites[key][frame] = new Image();

		this.sprites[key][frame].onload = function() {
			resolve();
		}.bind(this);

		this.sprites[key][frame].onerror = function() {
			console.log("Loading of '" + source + "' failed")
			reject();
		}.bind(this);

		this.sprites[key][frame].src = source;
	}.bind(this));
}


SpriteManager.prototype.loadFromSpriteTable = function(spriteTable, update)
{
	return new Promise(function(resolve, reject) {
		var count = 0;

		// Determine number of images to load
		for(var i = 0; i < spriteTable.length; i++) {
			if('frames' in spriteTable[i])
				count += spriteTable[i]['frames'];
			else
				count += 1;
		}

		var images_left = count;

		/** Load sprites from sprite table **/
		for(var i = 0; i < spriteTable.length; i++) {
			var key = spriteTable[i]['key'];

			// For animated sprites, create array with one image per frame
			if('frames' in spriteTable[i]) {
				for(var j = 1; j <= spriteTable[i]['frames']; j++) {
					this.loadImage(key, j - 1, 'tiles/' + spriteTable[i]['src'] + "_" + j + '.png').then(
						function() {
							images_left--;
							if(images_left == 0)
								resolve();
							else
								update(images_left, count);
						}.bind(this));
				}

				continue;
			}

			// For other sprites, create a 1-frame animation
			this.loadImage(key, 0, 'tiles/' + spriteTable[i]['src'] + '.png').then(
				function() {
					images_left--;
					if(images_left == 0)
						resolve();
					else
						update(images_left, count);
				}.bind(this));
		}
	}.bind(this));
}
