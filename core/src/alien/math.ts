/** @module Alien **/
"use strict";

/**
 * Returns the distance to and type of the ground object
 * directly underneath the player
 */
function findGround(player, level)
{
	var x_left = Math.floor(player.x / 32);
	var x_right = Math.floor((player.x + player.width) / 32);

	var y = Math.floor(player.y / 32);

	var height = level.getHeight();

	for(var i = y; i < height; i++) {
		var code_left = level.levelMap[i][x_left];
		var code_right = level.levelMap[i][x_right];

		if(code_left >= 288 && code_left <= 303 || code_right >= 288 && code_right <= 303) {
			return {x: x_left, y: i, dist: (i * 32 - player.y), type: 'Snow'};
		}
	}

	return null;
}


/**
 * Checks whether the X coordaintes of two objects collide
 *
 * @param {Object} objectA - First object
 * @param {Object} objectB - Second object
 * @return {false|Object} False if they do not collide
 */
function collisionCheckX(objectA, objectB): any
{
	var gapXA = objectA.x - (objectB.x + objectB.width);
	var gapXB = objectB.x - (objectA.x + objectA.width);

	if(gapXA >= 0 || gapXB >= 0)
		return false;

	return {
		type: objectB.type,
		normal: (gapXA < gapXB)?gapXB:-gapXA
	};
}


/**
 * Checks whether the Y coordaintes of two objects collide
 *
 * @param {Object} objectA - First object
 * @param {Object} objectB - Second object
 * @return {false|Object} False if they do not collide
 */
function collisionCheckY(objectA, objectB): any
{
	var gapYA = objectA.y - (objectB.y + objectB.height);
	var gapYB = objectB.y - (objectA.y + objectA.height);

	if(gapYA >= 0 || gapYB >= 0)
		return false;

	return {
		type: objectB.type,
		normal: (gapYA < gapYB)?gapYB:-gapYA
	};
}


/**
 * Checks whether two objects are colliding and returns
 * a possible resolution strategy.
 *
 * @param {Object} objectA - First object
 * @param {Object} objectB - Second object
 * @return {false|Object} False if they do not collide
 */
function collisionCheck(objectA, objectB): any
{
	if(objectA === undefined || objectB === undefined) {
		console.trace();
		console.error("Object is undefined in collision check");
	}
	
	var collideX = collisionCheckX(objectA, objectB);
	var collideY = collisionCheckY(objectA, objectB);

	if(collideX === false || collideY === false)
		return false;

	var ci = {
		type: objectB.type,
		normal: {
			x: collideX.normal,
			y: collideY.normal
		},
		axis: (Math.abs(collideX.normal) < Math.abs(collideY.normal))?'x':'y'
	};

	return ci;
}


function detectCollisionArray(objectA, objectsB, callback, offset)
{
	var box;

	for(var key in objectsB) {
		if(offset) {
			// Copy box for collision detection
			box = {x: objectsB[key].x + offset.x,
					   y: objectsB[key].y + offset.y,
					   width: objectsB[key].width,
					   height: objectsB[key].height,
					   type: objectsB[key].type};
		} else {
			box = objectsB[key];
		}

		var ci = collisionCheck(objectA, box);

		if(!ci)
			continue;

		if(typeof ci.type == "object") {
			detectCollisionArray(objectA, ci.type, callback, box);
		} else {
			callback(ci);
		}
	}
}


/**
 * Checks whether a given position is within a box
 */
function inBox(x, y, box)
{
	if(x >= box.x && x <= box.x + box.width &&
		 y >= box.y && y <= box.y + box.height)
			return true;
	return false;
}


/**
 * Clamps the value between two extremes.
 *
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max)
{
	return Math.min(max, Math.max(min, value));
}


/**
 * Returns the sign of the number, 1 for positive, -1 for negative.
 */
function sign(number)
{
	return (number >= 0)?1:-1;
}


/**
 * Linear interpolation
 */
function lerp(from, to, t)
{
	return from + (to - from) * t;
}
