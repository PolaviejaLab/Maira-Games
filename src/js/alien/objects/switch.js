/** @module Alien **/
"use strict";

/**
 * Creates new switch object.
 *
 * @class
 * @classdesc Object representing a switch in the alien girl game.
 */
function Switch()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

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


  this.isActive = function() {
    return this.activeState == this.states[this.sprite];
  }


  this.setActiveState = function(activeState)
  {
    if(activeState !== undefined)
      this.activeState = activeState;
  }


  this.setControlGroup = function(controlGroup)
  {
    var engine = this.getEngine();

    if(controlGroup !== undefined) {
      if(engine !== undefined)
        engine.removeSensorFromControlGroup(this.controlGroup, this);

      this.controlGroup = controlGroup;

      if(engine !== undefined)
        engine.addSensorToControlGroup(this.controlGroup, this);
    }
  }


  /**
   * Serialize state to array
   */
  this.toArray = function()
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
  this.fromArray = function(array)
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
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;

    this.width = 32;
    this.height = 32;

    this.sprite = this.baseSprite;

    // Find player
    this.player = this.parent.getObject("player_1");

    // Add switch to control group; engine might not have been defined before
    this.setControlGroup(this.controlGroup);
  }


  this.updateCollider = function()
  {
  }


  /**
	 * Update stating position of the switch
	 *
	 * @param {number} x - X coordinate of switch starting location
   * @param {number} y - Y coordinate of switch starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for switch
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
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
  this.update = function(keyboard)
  {
    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y - 10 + (dirY == 1) * (this.height);

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
  this.draw = function(context)
  {
    this.parent.spriteManager.drawSprite(context, this, this.states[this.sprite], 0);
  }
}

Switch.prototype = new BaseObject();
