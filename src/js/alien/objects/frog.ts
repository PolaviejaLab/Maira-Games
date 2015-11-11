/** @module Alien **/
"use strict";

/**
 * Creates new frog object.
 *
 * @class
 * @classdesc Object representing an frog in the alien girl game.
 */
function Frog()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;

  // Worm and player objects to check collisions against
  this.player = false;
  this.worms = [];


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'frog',
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
   * Setups the frog at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
    this.alive = true;

    // Find worms
    var names = this.parent.getObjectNames();

    for(var i = 0; i < names.length; i++) {
      var object = this.parent.getObject(names[i]);
      if(object.type == 'worm')
        this.worms.push(object);
    }

    // Find player
    this.player = this.parent.getObject("player_1");
  }


  /**
	 * Update stating position of the frog
	 *
	 * @param {number} x - X coordinate of frog starting location
   * @param {number} y - Y coordinate of frog starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for frog
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the frog
   */
  this.update = function(keyboard)
  {
    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the frog to touch the surface
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

    // Kill any worms that we encounter
    for(var i = 0; i < this.worms.length; i++) {
      var collision = collisionCheck(this, this.worms[i]);

      if(collision)
        this.worms[i].kill();
    }


    var collision = collisionCheck(this, this.player);

    if(!collision)
      return;

    // Move when being pushed by the player
    if(push_key && this.alive) {
      if(collision.axis == 'x' && Math.abs(collision.normal.x) < 5)
        this.x += collision.normal.x;
    }

    // Kill frog when jumped on it from the top
    if(collision.axis == 'y' && this.player.velY > 4)
      this.alive = false;
  }


  /**
   * Draws the frog to the specified context
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

Frog.prototype = new BaseObject();
