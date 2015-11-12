/** @module Alien **/
"use strict";

/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
class Bomb extends GraphicalObject
{
  private velY: number;
  private gravity: number;
  private alive: boolean;
  private aggressionLevel: number;
  private sprite: number;
  
  
  constructor()
  {
    super()
    
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);
      
    this.velY = 0;
    this.gravity = 0.3;
    this.alive = true;
    this.aggressionLevel = 0;
  
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
      'type': 'bomb',
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
   * Setups the enemy at the start of the game
   */
  reset()
  {
    this.resetPosition();
  }


  /**
   * Set base sprite for bomb
   * @param {number} sprite - ID of base sprite
   */
  setBaseSprite(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the bomb
   */
  update()
  {
    var level = <AGLevel> this.parent.getObject("level");

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
   * Draws the bomb to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  draw(context: CanvasRenderingContext2D)
  {
    var game = <AGGame> this.parent;
    
    game.spriteManager.drawSprite(context, this, this.sprite, 0);
  }
}
