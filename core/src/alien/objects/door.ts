/** @module Alien **/
"use strict";

/**
 * Creates new door object.
 *
 * @class
 * @classdesc Object representing a door in the alien girl game.
 */
class Door extends GraphicalObject
{
  private sprite: number;
  private state: boolean;
  public controlGroup: number;
  private direction: string;
  private player: AGPlayer;
  
  constructor()
  {
    super()
    
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);
    
    this.sprite = 0;
    this.state = false;
 
    /** This is a bug, the parent class should initialize this **/
    this.components = {};
  
    this.controlGroup = 0;
    this.direction = 'S';
  
    this.properties = [
      { 'caption': 'Direction', 'type': 'select',
        'options': [
          { 'value': 'S', 'caption': 'Source' },
          { 'value': 'T', 'caption': 'Target' }
        ],
        'set': function(direction) { this.setDirection(direction); }.bind(this),
        'get': function() { return this.direction; }.bind(this)
      },
      {
        'caption': 'ControlGroup', 'type': 'select',
        'options': [
          { 'value': 0, 'caption': 0 },
          { 'value': 1, 'caption': 1 },
          { 'value': 2, 'caption': 2 },
        ],
        'set': function(controlGroup) { this.setControlGroup(controlGroup); }.bind(this),
        'get': function() { return this.controlGroup; }.bind(this)
      }];
  }

  setDirection(direction)
  {
    if(direction !== undefined)
      this.direction = direction;
  }


  setControlGroup(controlGroup)
  {
    var engine = this.getEngine();

    if(controlGroup !== undefined) {
      if(engine !== undefined)
        engine.removeActorFromControlGroup(this.controlGroup, this);

      this.controlGroup = parseInt(controlGroup);

      if(engine !== undefined) {
        engine.addActorToControlGroup(this.controlGroup, this);
      }
    }
  }


  setState(state)
  {
    this.state = state;
    this.updateCollider();
  }


  /**
   * Serialize state to array
   */
  toArray()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'door',
      'direction': this.direction,
      'controlGroup': this.controlGroup,
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
    this.setDirection(array.direction);
    this.setControlGroup(array.controlGroup);
    this.type = array.type;
  }


  /**
   * Setups the enemy at the start of the game
   */
  reset()
  {
    this.resetPosition();
    this.setDimensions(32, 32);

    if(this.getComponent('collider') === undefined)
    {
      var collider = new Collider();

      // Player body
      var box = new Box(0, 0, this.width - 10, this.height - 14);
      collider.push(box);
      this.addComponent("collider", collider);
      
      this.updateCollider();
    }

    // Find player
    this.player = <AGPlayer> this.parent.getObject("player_1");

    // Add actor to control group; engine might not have been defined before
    this.setControlGroup(this.controlGroup);
  }


  updateCollider()
  {
    var collider = <Collider> this.getComponent("collider");

    for(var i = 0; i < collider.length(); i++) {
        collider.getItem(i).x = this.x;
        collider.getItem(i).y = this.y;
        collider.getItem(i).width = this.width;
        collider.getItem(i).height = this.height;
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


  /**
   * Updates the rock
   */
  update(keyboard: Keyboard)
  {
    var collision = collisionCheck({x: this.x, y: this.y, width: this.width, height:16}, this.player);

    if(collision && this.direction == 'S') {
      // Find target
      
      var children = this.parent.getObjectNames();
      
      for(var key in children) {
        var child = this.parent.getObject(key);

        if(child.type != 'door')
          continue;
        
        var door: Door = <Door> child; 

        if(door.controlGroup == this.controlGroup && door.direction == 'T')
        {
          this.player.x = door.x;
          this.player.y = door.y;
        }
      }
    }

    // Update collider after box position changed
    this.updateCollider();
  }


  /**
   * Draws the door to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  draw(context)
  {
    var box = { 'x': this.x, 'y': this.y - 32, 'width': 32, 'height': 32 };
    var game = <AGGame> this.parent;

    if(this.state) {
      game.spriteManager.drawSprite(context, this, this.sprite, 0);
      game.spriteManager.drawSprite(context, box, this.sprite + 1, 0);
    } else {
      game.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
      game.spriteManager.drawSprite(context, box, this.sprite + 3, 0);
    }

    if(this.getEngine().isDebugMode()) {
      var collider = this.getComponent("collider");
      collider.draw(context);
    }
  }
}


