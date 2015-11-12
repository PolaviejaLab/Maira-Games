/** @module Alien **/
"use strict";

/**
 * Creates new rock object.
 *
 * @class
 * @classdesc Object representing a rock in the alien girl game.
 */
class Rock extends GraphicalObject
{
  public mode: string;
  public velY: number;
  public gravity: number;
  public sprite: number;  
  public player: AGPlayer;
  
  constructor()
  {
    super();

    this.mode = 'rock';
  
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);
  
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
      'type': 'rock',
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
    this.type = array.type;
  }


  /**
   * Setups the enemy at the start of the game
   */
  reset()
  {
    this.resetPosition();
    this.setDimensions(32, 32);

    this.mode = 'rock';

    if(this.getComponent('collider') === undefined)
    {
      // Create collider
      var collider = new Collider();      

      // Player body
      var box = new Box(0, 0, this.width - 10, this.height - 14);
      collider.push(box);
      
      this.addComponent("collider", collider);
      this.updateCollider();
    }

    // Find player
    this.player = <AGPlayer> this.parent.getObject("player_1");
  }


  updateCollider()
  {
    var collider = <Collider> this.getComponent("collider");

    for(var i = 0; i < collider.length(); i++) {
      if(this.mode == 'rock')
      {
        collider.getItem(i).x = this.x + 5;
        collider.getItem(i).y = this.y + 14;
        collider.getItem(i).width = this.width - 10;
        collider.getItem(i).height = this.height - 14;
      } else {
        collider.getItem(i).x = this.x;
        collider.getItem(i).y = this.y;
        collider.getItem(i).width = this.width;
        collider.getItem(i).height = this.height;
      }
    }
  }


  /**
   * Set base sprite for rock
   * @param {number} sprite - ID of base sprite
   */
  setBaseSprite(sprite)
  {
    this.sprite = sprite;
  }


  switchToGround(sx, sy)
  {
    var level = <AGLevel> this.parent.getObject("level");
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
  update(keyboard)
  {
    if(this.mode != 'rock')
      this.updateCollider();

    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = <AGLevel> this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y - 10 + (dirY == 1?1:0) * (this.height);

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
  draw(context)
  {
    var game = <AGGame> this.parent;
    
    if(this.mode == 'rock') {
      game.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      game.spriteManager.drawSprite(context, this, 0x0116, 0);
    }

    if(this.getEngine().isDebugMode()) {
      var collider = this.getComponent("collider");
      collider.draw(context);
    }
  }
}
