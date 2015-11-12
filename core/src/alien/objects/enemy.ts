/** @module Alien **/
"use strict";

/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
class Enemy extends GraphicalObject
{
  private alive: boolean = true;
  private flying: boolean = true;
  private killable: boolean = true;
  
  private velY: number = 0;
  private rotation: number;
  private frameCount: number = 1;
  
  private gravity: number = 0.3;
  private aggressionLevel: number = 0;
  
  private targetX: number;
  private targetY: number;
  
  constructor()
  {
    super();
  
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);     
  
    this.properties = [
      { 'caption': 'Killable', 'type': 'boolean',
        'set': function(killable) { this.killable = killable; }.bind(this),
        'get': function() { return this.killable; }.bind(this)
      },
      { 'caption': 'Flying', 'type': 'boolean',
        'set': function(flying) { this.flying = flying; }.bind(this),
        'get': function() { return this.flying; }.bind(this)
      },
      {
        'caption': 'Aggression',
        'type': 'select',
        'options': [
          { 'value': 0, 'caption': 'Not aggressive', },
          { 'value': 1, 'caption': 'Aggressive' }
        ],
        'set': function(aggression) { this.setAggressionLevel(aggression); }.bind(this),
        'get': function() { return this.aggressionLevel; }.bind(this)
      }
    ];
  }


  /**
   * Serialize state to array
   */
  toArray()
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
  fromArray(array)
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
  reset()
  {
    var game: AGGame = <AGGame> this.parent;
    
    var startingPosition = this.getStartingPosition();
    
    this.targetX = startingPosition.x;
    this.targetY = startingPosition.y;

    this.resetPosition();

    this.alive = true;

    this.frameCount = game.spriteManager.getFrameCount(this.sprite);

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
  setAggressionLevel(aggressionLevel)
  {
    this.aggressionLevel = aggressionLevel;
  }


  /**
   * Set base sprite for enemy
   * @param {number} sprite - ID of base sprite (dead sprite is +1)
   */
  setBaseSprite(sprite)
  {
    this.sprite = sprite;
  }


  updateGravity()
  {
    var level: AGLevel = <AGLevel> this.parent.getObject("level");    

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1?1:0) * (this.height - 20);

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
  updateHunting()
  {
    var player: AGPlayer = 
      <AGPlayer> this.parent.getObject("player_1");

    var startingPosition = this.getStartingPosition();

    if(!player)
      throw new Error("Could not find object player_1");

    var player_underneath =
      player.x + player.width / 2 >= this.x &&
      player.x + player.width / 2 <= this.x + this.width &&
      player.y > this.y;

    var player_went_past = (player.x - 2 * player.width) > startingPosition.x;


    if(this.aggressionLevel != 0)
    {
      /** Move towards player when player is underneath **/
      if(player_underneath || player_went_past) {
        this.targetX = player.x;
        this.targetY = player.y;
      } else {
        this.targetX = startingPosition.x;
        this.targetY = startingPosition.y;
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
  updateDying()
  {
    this.updateGravity();

    this.rotation = lerp(this.rotation, Math.PI, 0.025);
  }


  /**
   * Updates the enemy
   */
  update()
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
  draw(context)
  {
    var game: AGGame = <AGGame> this.parent;
    var frame = Math.floor((this.getEngine().getTimestamp() / 120) % this.frameCount);

    if(this.alive) {
      game.spriteManager.drawSprite(context, this, this.sprite, frame);
    } else {
      game.spriteManager.drawSprite(context, this, this.sprite + 1, 0, function(context) {
        context.rotate(this.rotation);
      }.bind(this));
    }
  }
}
