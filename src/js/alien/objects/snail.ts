/** @module Alien **/
"use strict";

/**
 * Creates new snail object.
 *
 * @class
 * @classdesc Object representing an snail in the alien girl game.
 */
function Snail()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 24;
  this.height = 18;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'snail',
      'sprite': this.sprite
    };
  }


  /**
   * Unserialize state from array
   */
  this.fromArray = function(array)
  {
    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
  }


  /**
   * Setups the snail at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
    this.alive = true;
  }


  /**
	 * Update stating position of the snail
	 *
	 * @param {number} x - X coordinate of snail starting location
   * @param {number} y - Y coordinate of snail starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for snail
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the snail
   */
  this.update = function(keyboard)
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the snail to touch the surface
     */
    var callback = function(hit) {
      if(hit.type == 'water') {
        hit.y += 24;
        hit.dy += 24;
      }
      return hit;
    }

    // Apply gravity
    var hit = level.sensor(
      { x: this.x + this.width / 2, y: oriY },
      { x: 0, y: dirY }, 256, callback);

    if(dirY > 0 && hit && hit.dy < 10) {
      this.y = hit.y - this.height;
      this.velY = 0;
    }

    this.velY += this.gravity;
    this.y += this.velY;
  }


  /**
   * Draws the snail to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    if(this.alive) {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      this.parent.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
    }
  }
}

Snail.prototype = new BaseObject();
