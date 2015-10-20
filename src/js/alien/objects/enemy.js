/** @module Alien **/
"use strict";

/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
function Enemy()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;
  this.alive = true;
  this.aggressionLevel = 0;
  this.killable = true;
  this.flying = true;

  this.sprite = 0;
  this.frameCount = 1;

  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'enemy',
      'sprite': this.sprite,
      'aggressionLevel': this.aggressionLevel,
      'killable': this.killable
    };
  }


  /**
   * Unserialize state from array
   */
  this.fromArray = function(array)
  {
    if('aggressionLevel' in array)
      this.setAggressionLevel(array.aggressionLevel);

    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);

    //this.killable = array.killable;
  }


  /**
   * Setups the enemy at the start of the game
   */
  this.reset = function()
  {
    this.targetX = this.baseX;
    this.targetY = this.baseY;

    this.x = this.baseX;
    this.y = this.baseY;

    this.alive = true;

    this.frameCount = this.parent.spriteManager.getFrameCount(this.sprite);

    /***
     * This is a work-around and these properties should be available from
     * within the editor instead.
     */

    // Ladybug is not killable and does not fly
    if(this.sprite == 0x0A0A) {
      this.flying = false;
      this.killable = false;
    }

    // Bees cannot be killed
    if(this.sprite == 0x0A03) {
      this.killable = false;
    }

    // Flies and bats
    if(this.sprite == 0x0A06 || this.sprite == 0x0A00) {
      this.setAggressionLevel(1);
    }
  }


  /**
   * Set the aggression level of the enemy
   *
   * @param {number} aggressionLevel - Aggressiveness of animal
   */
  this.setAggressionLevel = function(aggressionLevel)
  {
    this.aggressionLevel = aggressionLevel;
  }


  /**
	 * Update stating position of the enemy
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
   * Set base sprite for enemy
   * @param {number} sprite - ID of base sprite (dead sprite is +1)
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  this.updateGravity = function()
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the enemy to touch the surface
     */
    var callback = function(hit) {
      if(hit.type == 'water') {
        hit.y += 24;
        hit.dy += 24;
      }
      return hit;
    }

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
   * Updates the enemy; it is hunting the player
   */
  this.updateHunting = function()
  {
    var player = this.parent.getObject("player_1");

    if(!player)
      throw new Error("Could not find object player_1");

    var player_underneath =
      player.x + player.width / 2 >= this.x &&
      player.x + player.width / 2 <= this.x + this.width &&
      player.y > this.y;

    var player_went_past = (player.x - 2 * player.width) > this.baseX;


    if(this.aggressionLevel != 0)
    {
      /** Move towards player when player is underneath **/
      if(player_underneath || player_went_past) {
        this.targetX = player.x;
        this.targetY = player.y;
      } else {
        this.targetX = this.baseX;
        this.targetY = this.baseY;
      }

      this.x = lerp(this.x, this.targetX, 0.2);
      this.y = lerp(this.y, this.targetY, 0.3);
    }

    if(!this.flying)
      this.updateGravity();

    /** Check collision with player **/
    var collision = collisionCheck(this, player);
    if(this.alive && collision) {
      if(collision.normal.y < 0 || player_went_past) {
        if(this.aggressionLevel != 0)
          player.kill("enemy");
      } else {
        if(this.killable) {
          this.alive = false;
          player.events.push("KILLED_ENEMY");

          // Reset rotation
          this.rotation = 0;

          // Player kills the bee, make sure it falls with the same speed
          // as the player, otherwise the player will pass it.
          this.velY = player.velY;
        }
      }
    }
  }


  /**
   * Updates the enemy; it is dying
   */
  this.updateDying = function()
  {
    this.updateGravity();

    this.rotation = lerp(this.rotation, Math.PI, 0.025);
  }


  /**
   * Updates the enemy
   */
  this.update = function()
  {
    if(this.alive) {
      this.updateHunting();
    } else {
      this.updateDying();
    }
  }


  /**
   * Draws the enemy to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    var frame = Math.floor((this.getEngine().timestamp / 120) % this.frameCount);

    if(this.alive) {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, frame);
    } else {
      this.parent.spriteManager.drawSprite(context, this, this.sprite + 1, 0, function(context) {
        context.rotate(this.rotation);
      }.bind(this));
    }
  }
}

Enemy.prototype = new BaseObject();
