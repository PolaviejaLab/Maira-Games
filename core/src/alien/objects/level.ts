/** @module Alien **/
"use strict";

var spriteSize = 32;

interface AGLevelDynamicLevelGeometry {
	x: number;
	y: number;
	frameCount: number;
	sprite: number;
}


interface AGLevelLines {
	a: any;
	b: any;
	color: any;
}


/**
 * Creates a new level object.
 *
 * @class
 * @classdesc Represents a level in the alien girl game.
 * @param {Object} levelMap - Two-dimensional array containing the level
 */
class AGLevel extends GameObject
{
	public levelMap: number[][];
	private staticLevelCanvas: HTMLCanvasElement;	
	
	private collisionTypes: {[key: number]: any};
	private collisionBoxes: any;	// QuadTree
	private dynamicLevelGeometry: AGLevelDynamicLevelGeometry[];
	private lines: AGLevelLines[];
	
	constructor(levelMap)
	{
		super();
		
		this.levelMap = levelMap;
		this.collisionTypes = {};
	
		// Variable that contains canvas for drawing static level elements
		this.staticLevelCanvas = document.createElement("canvas");
	
		// Variable that contains collision geometry
		this.collisionBoxes = undefined;
	
		// Variable that contains coordinates and IDs for animated sprites
		this.dynamicLevelGeometry = [];
	
		// Contains debugging lines to draw
		this.lines = [];
	}

	/**
	 * Reset level
	 */
	reset()
	{
		for(var i = 0; i < spriteTable.length; i++) {
			var key = spriteTable[i].key;
			this.collisionTypes[key] = spriteTable[i].collision;
		}

		this.cacheLevelGeometry();
		this.generateCollisionGeometry();
	};


	fromArray(array: number[][])
	{
		this.levelMap = array;
	}


	toArray(): number[][]
	{
		return this.levelMap;
	}


	update(input)
	{
	}


	/**
	 * Converts world coordinates to level (sprite) coordinates
	 */
	worldToLevelCoords(worldCoord: Point)
	{
		return {
			x: Math.floor(worldCoord.x / spriteSize),
			y: Math.floor(worldCoord.y / spriteSize)
		};
	}


	/**
	* Pixel level sensor line for collision detection.
	*
	* Starts a sensor line at _origin_ in direction _dir_
	* and calls the function _func_ for all collisions until
	* the distance is greater than _length_ or the function
	* _func_ returns a value.
	 */
	sensor(origin: Point, dir: Point, length: number, func)
	{
		if(isNaN(origin.x) || isNaN(origin.y)) {
			console.trace();
			throw new Error("Sensor: Origin is set to NaN (" + origin.x + ", " + origin.y + ")");
		}

		if(isNaN(dir.x) || isNaN(dir.y)) {
			console.trace();
			throw new Error("Sensor: Direction is set to NaN (" + dir.x + ", " + dir.y + ")");
		}

		var o = this.worldToLevelCoords(origin);

		var result = this.spriteSensor(o, dir, length / spriteSize, function(hit)
		{
			if(dir.x == 0) hit.x = origin.x; else	hit.x = hit.sx * spriteSize;
			if(dir.y == 0) hit.y = origin.y; else	hit.y = hit.sy * spriteSize;

			// Collide with right most edge for leftward sensors
			if(dir.x < 0) hit.x += spriteSize;

			// Collide with bottom edge for upward sensors
			if(dir.y < 0)	hit.y += spriteSize;

			// Half blocks
			if(hit.type == 'topHalf') {
				if(dir.y < 0) hit.y -= 14;
				if(dir.x != 0 && origin.y - hit.sy * spriteSize > (18/32)*spriteSize) return false;
			}

			// Ramp down
			if(hit.type == 'hillDown') {
				if(dir.y == 0) hit.x += (hit.sy * spriteSize - origin.y) + spriteSize;
				if(dir.x == 0) hit.y += (hit.sx * spriteSize - origin.x) + spriteSize;
			}

			// Ramp up
			if(hit.type == 'hillUp') {
				if(dir.y == 0) hit.x -= (hit.sy * spriteSize - origin.y) + spriteSize;
				if(dir.x == 0) hit.y -= (hit.sx * spriteSize - origin.x);
			}

			// Compute difference
			hit.dx = hit.x - origin.x;
			hit.dy = hit.y - origin.y;

			// Do not report hits in opposite direction
			if(dir.x != 0 && dir.x * hit.dx <= 0)
				return false;

			// Invoke callback
			hit = func(hit);

			if(hit)
				return hit;
		});

		// Draw result
		if(this.getEngine().isDebugMode()) {
			if(dir.x != 0)
				this.lines.push({ a: origin, b: result, color: 'blue' });
			else
				this.lines.push({ a: origin, b: result, color: 'red' });
		}

		return result;
	};


	/**
	 * Sprite level sensor line for collision detection.
	 *
	 * Starts a sensor line at _origin_ in direction _dir_
	 * and calls the function _func_ for all collisions until
	 * the distance is greater than _length_ or the function
	 * _func_ returns a value.
	 */
	spriteSensor(origin, dir, length, func)
	{
		if(isNaN(origin.x) || isNaN(origin.y))
			throw new Error("SpriteSensor: Origin is set to NaN (" + origin.x + ", " + origin.y + ")");

		if(isNaN(dir.x) || isNaN(dir.y))
			throw new Error("SpriteSensor: Direction is set to NaN (" + dir.x + ", " + dir.y + ")");

		for(var i = 0; i < Math.ceil(length); i++)
		{
			var l: any = {
				sx: origin.x + dir.x * i,
				sy: origin.y + dir.y * i
			};

			/**
			 * Out of bounds, return 'Bounds'
			 */
			if(l.sx < 0 || l.sx >= this.getWidth() ||
				 l.sy < 0 || l.sy >= this.getHeight())
			{
				return {
					type: 'Bounds',
					sx: clamp(l.sx, 0, this.getWidth()),
					sy: clamp(l.sy, 0, this.getHeight())
				};
			}

			// Get sprite number
			var sprite = this.levelMap[l.sy][l.sx];

			if(sprite in this.collisionTypes) {
				// Add type of collision to hit object
				l.sprite = sprite;
				l.type = this.collisionTypes[sprite];

				// Invoke callback, it will return the hit if it was accepted
				var hit = func(l);

				// If we hit something, return it, otherwise continue
				if(hit && hit.type !== false)
					return hit;
			}
		}

		// We did not hit anything, return false
		return { type: false };
	};


	/*********************
	 * Drawing functions *
	 *********************/


	/**
	 * Function to handle simple sprite animations
	 */
	animate(base, frames)
	{
		var deltaT = this.getEngine().getTimestamp() / 140;
		return base + Math.floor(1 + deltaT % frames);
	};


	/**
	 * Draws a single sprite in the grid
	 */
	drawSprite(context, x, y, sprite, frameCount)
	{
		var game = <AGGame> this.parent;
				
		if(sprite == 1 && !game.editMode)
			return;

		var box = {x: x * spriteSize, y: y * spriteSize, width: spriteSize, height: spriteSize};
		var frame = (this.getEngine().getTimestamp() >> 7) % frameCount;

		return game.spriteManager.drawSprite(context, box, sprite, frame);
	};


	/**
	 * Cache level geometry
	 */
	generateCollisionGeometry()
	{
		var width = this.levelMap[0].length * 32;
		var height = this.levelMap.length * 32;

		// Find nearest power of two, to align bins with level grid
		width = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));
		height = Math.pow(2, Math.ceil(Math.log(height) / Math.log(2)));

		this.collisionBoxes = new QuadTree(undefined, new Box(0, 0, width, height));

		for(var i = 0; i < this.levelMap.length; i++) {
			for(var j = 0; j < this.levelMap[0].length; j++) {
				var sprite = this.levelMap[i][j];

				if(sprite == 0)
					continue;

				if(this.collisionTypes[sprite] === true || this.collisionTypes[sprite] == 'waterBody') {
					this.collisionBoxes.insert(new Box(j * 32, i * 32, 32, 32));
				}

				if(this.collisionTypes[sprite] === 'topHalf') {
					this.collisionBoxes.insert(new Box(j * 32, i * 32, 32, 17));
				}

				if(this.collisionTypes[sprite] === 'hillUp') {
					for(var k = 0; k < 32; k++) {
						this.collisionBoxes.insert(new Box(j * 32, i * 32 + k, k, 1));
					}
				}

				if(this.collisionTypes[sprite] === 'hillDown') {
					for(var k = 0; k < 32; k++) {
						this.collisionBoxes.insert(new Box(j * 32 + (32 - k), i * 32 + k, k, 1));
					}
				}
			}
		}
	}


	/**
	 * Creates a cache of the level geometry. This cache consists of two parts:
	 *   - An image containing all the static geometry
	 *   - An array containing coordinates and IDs for all animated sprites
	 */
	cacheLevelGeometry()
	{
		var game = <AGGame> this.parent;
		
		this.staticLevelCanvas.width = this.getWidth() * spriteSize;
		this.staticLevelCanvas.height = this.getHeight() * spriteSize;

		this.dynamicLevelGeometry = new Array();
		var context = this.staticLevelCanvas.getContext("2d");

		for(var i = 0; i < this.levelMap.length; i++) {
			for(var j = 0; j < this.levelMap[0].length; j++) {
				var sprite = this.levelMap[i][j];
				var frameCount =  game.spriteManager.getFrameCount(sprite);

				// Ignore invalid sprites (that the sprite manager doesn't know about)
				if(!game.spriteManager.isSpriteValid(sprite))
					continue;

				// Sprites with 1 frame are static, more than one dynamic
				if(frameCount == 1)
					this.drawSprite(context, j, i, sprite, 1);
				else
					this.dynamicLevelGeometry.push({
						x: j, y: i, frameCount: frameCount, sprite: sprite
					});
			}
		}
	};


	/**
	 * Draw debug lines (from this.lines).
	 *
	 * @param {Context} context - Context to draw to.
	 */
	drawDebugLines(context)
	{
		for(var i = 0; i < this.lines.length; i++)
			this.drawLine(context, this.lines[i].a, this.lines[i].b, this.lines[i].color);
		this.lines = [];
	};


	/**
	 * Draw a line to the context.
	 *
	 * @param {Context} context - Context to draw to.
	 * @param {Object} a - Starting coordinate of the line.
	 * @param {Object} b - Final coordinate of the line.
	 * @param {Object} color - Color of the line.
	 */
	drawLine(context, a, b, color)
	{
		context.beginPath();
		context.moveTo(a.x, a.y);
		context.lineTo(b.x, b.y);
		context.closePath();
		context.strokeStyle = color;
		context.stroke();
	};


	/**
	 * Draw collision boxes
	 *
	 * @param {Context} context - Context to draw to.
	 */
	drawDebugCollisionBoxes(context)
	{
		this.collisionBoxes.draw(context);
		var player: AGPlayer = <AGPlayer> this.parent.getObject("player_1");
		var box = new Box(player.x, player.y, player.width, player.height);
		
		// Not implemented
	}


	/**
	 * Draw entire level.
	 *
	 * @param {Context} context - Context to draw to.
	 */
	draw(context)
	{
		context.drawImage(this.staticLevelCanvas, 0, 0);

		for(var i = 0; i < this.dynamicLevelGeometry.length; i++) {
			var item = this.dynamicLevelGeometry[i];
			this.drawSprite(context, item.x, item.y, item.sprite, item.frameCount);
		}

		if(this.getEngine().isDebugMode()) {
			this.drawDebugLines(context);
			this.drawDebugCollisionBoxes(context);
		}
	};

	/**
	* Returns the height of the level in sprites.
	*
	* @return {Number} Height of the level.
	*/
	getHeight(): number
	{
		return this.levelMap.length;
	};
	
	
	/**
	* Returns the width of the level in sprites.
	*
	* @return {Number} Width of the level.
	*/
	getWidth(): number
	{
		return this.levelMap[0].length;
	};

	
	/**
	* Sets the sprite at a specific block.
	*
	* @param {Object} coords - Coordinates.
	* @param {Number} sprite - Number of the sprite to set.
	*/
	setSprite(coords, sprite): boolean
	{
		// Check invalid coordinates
		if(coords.x < 0 || coords.y < 0)
			return false;
	
		// Expand level if not big enough
		if(this.levelMap.length < ( 1 + coords.y) ||
		this.levelMap[0].length < coords.x) {
	
			// Required dimensions
			var height = Math.max(1 + coords.y, this.levelMap.length);
			var width = Math.max(1 + coords.x, this.levelMap[0].length);
	
			for(var i = 0; i < height; i++) {
				if(i >= this.levelMap.length)
					this.levelMap[i] = [];
	
				for(var j = this.levelMap[i].length; j < width; j++)
					this.levelMap[i][j] = 0;
			}
		}
	
		this.levelMap[coords.y][coords.x] = sprite;
	
		this.cacheLevelGeometry();
		this.generateCollisionGeometry();
		
		return true;
	}
}
