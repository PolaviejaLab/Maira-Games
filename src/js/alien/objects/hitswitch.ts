/** @module Alien **/
"use strict";

/**
 * Creates new block switch object.
 *
 * @class
 * @classdesc Object representing a block switch in the alien girl game.
 */
function HitSwitch()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.sprite = 0;
  this.state = false;

  /** This is a bug, the parent class should initialize this **/
  this.components = {};

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


  this.setControlGroup = function(controlGroup)
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


  this.isActive = function()
  {
    return this.state;
  }

  /**
   * Serialize state to array
   */
  this.toArray = function()
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
  this.fromArray = function(array)
  {
    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
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

    this.state = false;

    if(this.getComponent('collider') === undefined)
    {
      // Create collider
      this.addComponent("collider", new Collider());

      // Player body
      var box = new Box(0, 0, this.width - 10, this.height - 14);
      this.getComponent("collider").push(box);
      this.updateCollider();
    }

    // Find player
    this.player = this.parent.getObject("player_1");

    // Add actor to control group; engine might not have been defined before
    this.setControlGroup(this.controlGroup);
  }


  this.updateCollider = function()
  {
    var collider = this.getComponent("collider");

    for(var i = 0; i < collider.length; i++) {
        collider[i].x = this.x + 4;
        collider[i].y = this.y + 4;
        collider[i].width = this.width - 8;
        collider[i].height = this.height - 8;
    }
  }


  /**
	 * Update stating position of the rock
	 *
	 * @param {number} x - X coordinate of enemy starting location
   * @param {number} y - Y coordinate of enemy starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for rock
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the hit switch
   */
  this.update = function(keyboard)
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
  this.draw = function(context)
  {
    var box = { 'x': this.x, 'y': this.y, 'width': 32, 'height': 32 };

    for(var i = 0; i < this.width / 32; i++) {
      box.x = this.x + 32 * i;
      this.parent.spriteManager.drawSprite(context, box, this.sprite, 0);
    }

    if(this.getEngine().debugMode) {
      var collider = this.getComponent("collider");
      collider.draw(context);
    }
  }
}

HitSwitch.prototype = new BaseObject();
