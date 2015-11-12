/** @module Alien **/
"use strict";

/**
 * Creates new switch object.
 *
 * @class
 * @classdesc Object representing a switch in the alien girl game.
 */
class Switch extends GraphicalObject
{
  public sprite: number;
  public baseSprite: number;
  
  public velY: number;
  public gravity: number;
  
  public states: number[];
  public key_state: boolean;
  
  public activeState: number;
  public controlGroup: number;
  
  public player: AGPlayer;
  
  constructor()
  {
    super();
    
    this.setStartingPosition(0, 0);
    this.setDimensions(32, 32);
  
    this.sprite = 0;
    this.baseSprite = 0;
  
    this.velY = 0;
    this.gravity = 0.3;
  
    this.states = [0x0704, 0x705, 0x706, 0x705];
    this.key_state = false;
  
    this.activeState = 0x704;
    this.controlGroup = 0;

    this.properties = [
      { 'caption': 'ActiveState', 'type': 'select',
        'options': [
          { 'value': 0x704, 'caption': 'Left' },
          { 'value': 0x705, 'caption': 'Middle' },
          { 'value': 0x706, 'caption': 'Right' }
        ],
        'set': function(activeState) { this.setActiveState(activeState); }.bind(this),
        'get': function() { return this.activeState; }.bind(this)
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


  isActive() {
    return this.activeState == this.states[this.sprite];
  }


  setActiveState(activeState)
  {
    if(activeState !== undefined)
      this.activeState = activeState;
  }


  setControlGroup(controlGroup)
  {
    var engine = this.getEngine();

    if(controlGroup !== undefined) {
      if(engine !== undefined)
        engine.removeSensorFromControlGroup(this.controlGroup, this);

      this.controlGroup = parseInt(controlGroup);

      if(engine !== undefined)
        engine.addSensorToControlGroup(this.controlGroup, this);
    }
  }


  /**
   * Serialize state to array
   */
  toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'switch',
      'sprite': this.states[this.sprite],
      'controlGroup': this.controlGroup,
      'activeState': this.activeState
    };
  }


  /**
   * Unserialize state from array
   */
  fromArray(array)
  {
    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
    this.setActiveState(array.activeState);
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

    this.sprite = this.baseSprite;

    // Find player
    this.player = <AGPlayer> this.parent.getObject("player_1");

    // Add switch to control group; engine might not have been defined before
    this.setControlGroup(this.controlGroup);
  }


  updateCollider = function()
  {
  }


  /**
   * Set base sprite for switch
   * @param {number} sprite - ID of base sprite
   */
  setBaseSprite(sprite)
  {
    for(var i = 0; i < this.states.length; i++)
      if(this.states[i] == sprite) {
        this.baseSprite = i;
        this.sprite = i;
      }
  }


  /**
   * Updates the switch
   */
  update(keyboard)
  {
    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = <AGLevel> this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y - 10 + (dirY == 1?1:0) * (this.height);

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

    var collision = collisionCheck({x: this.x, y: this.y, width: this.width, height:16}, this.player);

    // Switch when key is pressed by the player
    if(!push_key)
      this.key_state = false;

    if(collision && push_key && !this.key_state) {
      this.sprite = (this.sprite + 1) % this.states.length;
      this.key_state = true;

      var engine = this.getEngine();
      engine.updateControlGroupsState();
    }
  }


  /**
   * Draws the rock to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  draw(context)
  {
    var game = <AGGame> this.parent;
    game.spriteManager.drawSprite(context, this, this.states[this.sprite], 0);
  }
}
