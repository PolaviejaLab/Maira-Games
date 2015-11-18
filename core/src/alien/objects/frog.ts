/** @module Alien **/
"use strict";

/**
 * Creates new frog object.
 *
 * @class
 * @classdesc Object representing an frog in the alien girl game.
 */
class Frog extends GraphicalObject
{
  public alive: boolean = true;
  
  public velY: number;
  public gravity: number;
  
  public sprite: number;
  public player: AGPlayer;
  public worms: Worm[];
  
  
  /**
   * Setup a frog
   */
  constructor()
  {
    super();
    
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);

    this.velY = 0;
    this.gravity = 0.3;
  
    this.sprite = 0;
  
    // Worm objects to check collisions against
    this.worms = [];
  }


  /**
   * Serialize state to array
   */
  toArray()
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
  fromArray(array)
  {
    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
  }


  /**
   * Setups the frog at the start of the game
   */
  reset()
  {
    this.resetChildren();
    this.alive = true;

    // Find worms
    var names = this.parent.getObjectNames();

    for(var i = 0; i < names.length; i++) {
      var object = this.parent.getObject(names[i]);
      if(object.type == 'worm')
        this.worms.push(<Worm> object);
    }

    // Find player
    this.player = <AGPlayer> this.parent.getObject("player_1");
  }


  /**
   * Set base sprite for frog
   * @param {number} sprite - ID of base sprite
   */
  setBaseSprite(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the frog
   */
  update(keyboard)
  {
    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = <AGLevel> this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1?1:0) * (this.height - 20);

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
  }


  /**
   * Draws the frog to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  draw(context)
  {
    var game: AGGame = <AGGame> this.parent;
    
    if(this.alive) {
      game.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      game.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
    }
  }
}
