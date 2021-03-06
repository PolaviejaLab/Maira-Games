/** @module Alien **/
"use strict";

/**
 * Creates new worm object.
 *
 * @class
 * @classdesc Object representing an worm in the alien girl game.
 */
class Worm extends GraphicalObject
{
  public alive: boolean = true;
  
  public transform: boolean;
  public transformHeight: number;
  
  public sprite: number;
  public velY: number;
  public gravity: number;
  
  public maxHeight: number;
  
  constructor()
  {
    super();
    
    this.type = "worm";
    
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);
  
    this.velY = 0;
    this.gravity = 0.3;
  
    this.sprite = 0;
    this.alive = true;
    this.transform = false;
  
    this.maxHeight = 7;
  
    this.properties = [
      { 'caption': 'MaxHeight', 'type': 'select',
        'options': [
          { 'value': 1 * 32, 'caption': '1 block' },
          { 'value': 2 * 32, 'caption': '2 blocks' },
          { 'value': 3 * 32, 'caption': '3 blocks' },
          { 'value': 4 * 32, 'caption': '4 blocks' },
          { 'value': 5 * 32, 'caption': '5 blocks' },
          { 'value': 6 * 32, 'caption': '6 blocks' },
          { 'value': 7 * 32, 'caption': '7 blocks' },
          { 'value': 8 * 32, 'caption': '8 blocks' },
          { 'value': 9 * 32, 'caption': '9 blocks' }
        ],
        'set': function(maxHeight) { this.setMaxHeight(maxHeight); }.bind(this),
        'get': function() { return this.maxHeight; }.bind(this)
      }];
  }
  
  /**
   * Serialize state to array
   */
  toArray()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'worm',
      'sprite': this.sprite,
      'maxHeight': this.maxHeight
    };
  }


  /**
   * Unserialize state from array
   */
  fromArray(array)
  {
    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
    this.setMaxHeight(array.maxHeight);
  }


  /**
   * Setups the worm at the start of the game
   */
  reset()
  {
    this.resetPosition();
    this.alive = true;

    this.height = 32;
    this.width = 32;
    this.transform = false;
  }


  kill()
  {
    this.alive = false;
  }


  /**
   * Set maximum height of the worm
   *
   * @param {number} maxHeight - Maximum height
   */
  setMaxHeight(maxHeight)
  {
    this.maxHeight = parseInt(maxHeight);
  }


  /**
   * Set base sprite for worm
   * @param {number} sprite - ID of base sprite
   */
  setBaseSprite(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the worm
   */
  update()
  {
    var level = <AGLevel> this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1?1:0) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the worm to touch the surface
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

    // Check for hits with player
    var player = <AGPlayer> this.parent.getObject("player_1");

    var collision = collisionCheckX(this, player);

    if(collision && this.alive) {
      if(collisionCheckY(this, player)) {
        player.kill("worm/" + this.getName(), this.sprite);
      } else {
        var distanceY = this.y + this.height - player.y;

        if(distanceY > this.maxHeight)
          distanceY = this.maxHeight;

        this.transform = true;
        this.transformHeight = (distanceY>32)?distanceY:32;
      }
    } else {
      this.transform = false;
    }
  }


  /**
   * Draws the worm to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  draw(context)
  {
    var game = <AGGame> this.parent;
    
    if(this.transform) {
      var height = lerp(this.height, this.transformHeight, 0.4);
      this.y += (this.height - height);
      this.height = height;
      game.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
    } else {
      var height = lerp(this.height, 32, 0.1);
      this.y += (this.height - height);
      this.height = height;

      if(this.alive)
        game.spriteManager.drawSprite(context, this, this.sprite, 0);
      else
        game.spriteManager.drawSprite(context, this, this.sprite + 1, 0);
    }
  }
}
