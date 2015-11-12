/** @module Alien **/
"use strict";

/**
 * Creates new block switch object.
 *
 * @class
 * @classdesc Object representing a block switch in the alien girl game.
 */
class HitSwitch extends GraphicalObject
{
  public sprite: number;
  public state: boolean;
  
  public controlGroup: number;
  public player: AGPlayer;
  
  constructor()
  {
    super();
    
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);

    this.sprite = 0;
    this.state = false;
   
    this.controlGroup = 0;
  
    this.properties = [
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


  setControlGroup(controlGroup)
  {
    var engine = this.getEngine();

    if(controlGroup !== undefined) {
      if(engine !== undefined)
        engine.removeSensorFromControlGroup(this.controlGroup, this);

      this.controlGroup = parseInt(controlGroup);

      if(engine !== undefined) {
        engine.addSensorToControlGroup(this.controlGroup, this);
      }
    }
  }


  isActive()
  {
    return this.state;
  }


  /**
   * Serialize state to array
   */
  toArray()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'hitswitch',
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

    this.state = false;

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

    // Add actor to control group; engine might not have been defined before
    this.setControlGroup(this.controlGroup);
  }


  updateCollider()
  {
    var collider = <Collider> this.getComponent("collider");

    for(var i = 0; i < collider.length(); i++) {
        collider.getItem(i).x = this.x + 4;
        collider.getItem(i).y = this.y + 4;
        collider.getItem(i).width = this.width - 8;
        collider.getItem(i).height = this.height - 8;
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
   * Updates the hit switch
   */
  update(keyboard)
  {
    var collision = collisionCheck({x: this.x, y: this.y, width: this.width, height: this.height}, this.player);

    if(collision) {
      this.state = true;

      var engine = this.getEngine();
      engine.updateControlGroupsState();
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
    var box = { 'x': this.x, 'y': this.y, 'width': 32, 'height': 32 };

    for(var i = 0; i < this.width / 32; i++) {
      box.x = this.x + 32 * i;
      game.spriteManager.drawSprite(context, box, this.sprite, 0);
    }

    if(this.getEngine().isDebugMode()) {
      var collider = this.getComponent("collider");
      collider.draw(context);
    }
  }
}

