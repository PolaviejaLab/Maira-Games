/** @module Alien **/
"use strict";

/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
function Rock()
{
  this.mode = 'rock';

  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;

  /** This is a bug, the parent class should initialize this **/
  this.components = {};


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'rock',
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
    this.type = array.type;
  }


  /**
   * Setups the enemy at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;

    this.width = 32;
    this.height = 32;

    this.mode = 'rock';

    if(this.getComponent('collider') === undefined)
    {
      // Create collider
      this.addComponent("collider", new Collider());

      // Player body
      var box = new Box(0, 0, this.width - 10, this.height - 14);
      this.getComponent("collider").push(box);
      this.updateCollider();
    }

    // Find player
    this.player = this.parent.getObject("player_1");
  }


  this.updateCollider = function()
  {
    var collider = this.getComponent("collider");

    for(var i = 0; i < collider.length; i++) {
      if(this.mode == 'rock')
      {
        collider[i].x = this.x + 5;
        collider[i].y = this.y + 14;
        collider[i].width = this.width - 10;
        collider[i].height = this.height - 14;
      } else {
        collider[i].x = this.x;
        collider[i].y = this.y;
        collider[i].width = this.width;
        collider[i].height = this.height;
      }
    }
  }


  /**
	 * Update stating position of the rock
	 *
	 * @param {number} x - X coordinate of enemy starting location
   * @param {number} y - Y coordinate of enemy starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for rock
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  this.switchToGround = function(sx, sy)
  {
    var level = this.parent.getObject("level");
    this.mode = 'ground';

    // Find extents of quicksand
    var mn_sx = sx;
    var mx_sx = sx;

    while(level.levelMap[sy][mx_sx + 1] == 277)
      mx_sx += 1;

    while(level.levelMap[sy][mn_sx - 1] == 277)
      mn_sx -= 1;

    // Grow rock
    this.width = (mx_sx - mn_sx + 1) * 32;
    this.height = 32;

    this.x = mn_sx * 32;
    this.y = sy * 32;

    this.updateCollider();
  }


  /**
   * Updates the rock
   */
  this.update = function(keyboard)
  {
    if(this.mode != 'rock')
      this.updateCollider();

    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y - 10 + (dirY == 1) * (this.height);

    /**
     * Make sure hitting spikes or water causes the rock to touch the surface
     */
    var callback = function(hit) {

      if(hit.type == 'water') {
        hit.y += 18; // 24;
        hit.dy += 18; //24;

        if(hit.sprite == 277) {
          this.switchToGround(hit.sx, hit.sy);
          return;
        }
      }

      return hit;
    }.bind(this);

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

    var collision = collisionCheck({x: this.x, y: this.y, width: this.width, height:16}, this.player);

    // Move when being pushed by the player
    if(collision && collision.axis == 'x' && push_key) {
      this.x += collision.normal.x;
    }

    // Update collider after box position changed
    this.updateCollider();
  }


  /**
   * Draws the rock to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    if(this.mode == 'rock') {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      this.parent.spriteManager.drawSprite(context, this, 0x0116, 0);
    }

    if(this.getEngine().debugMode) {
      var collider = this.getComponent("collider");
      collider.draw(context);
    }
  }
}

Rock.prototype = new BaseObject();
