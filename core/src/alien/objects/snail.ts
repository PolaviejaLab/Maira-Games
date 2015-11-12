/** @module Alien **/
"use strict";

/**
 * Creates new snail object.
 *
 * @class
 * @classdesc Object representing an snail in the alien girl game.
 */
class Snail extends GraphicalObject
{
  public alive: boolean;
  public velY: number;
  public gravity: number;
  public sprite: number;
  
  
  constructor()
  {
    super();
    
    this.setStartingPosition(0, 0);
    this.setDimensions(24, 18);

    this.velY = 0;
    this.gravity = 0.3;
  
    this.sprite = 0;
  }


  /**
   * Serialize state to array
   */
  toArray()
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
  fromArray(array)
  {
    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
  }


  /**
   * Setups the snail at the start of the game
   */
  reset()
  {
    this.resetPosition();
    this.alive = true;
  }


  /**
   * Set base sprite for snail
   * @param {number} sprite - ID of base sprite
   */
  setBaseSprite(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the snail
   */
  update(keyboard: Keyboard)
  {
    var level = <AGLevel> this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1?1:0) * (this.height - 20);

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
  draw(context)
  {
    var game = <AGGame> this.parent;
    
    if(this.alive) {
      game.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      game.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
    }
  }
}
