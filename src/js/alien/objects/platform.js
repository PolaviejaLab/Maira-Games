/** @module Alien **/
"use strict";

/**
 * Creates new platform object.
 *
 * @class
 * @classdesc Object representing a platform in the alien girl game.
 */
function Platform()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.sprite = 0;

  /** This is a bug, the parent class should initialize this **/
  this.components = {};

  this.direction = 'R';
  this.controlGroup = 0;
  this.distance = 1;

  this.properties = [
    { 'caption': 'Direction', 'type': 'select',
      'options': [
        { 'value': 'L', 'caption': 'Left' },
        { 'value': 'R', 'caption': 'Right' }
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
    },
    {
      'caption': 'Distance', 'type': 'select',
      'options': [
        { 'value': '1', 'caption': '1 Block' },
        { 'value': '2', 'caption': '2 Blocks' },
        { 'value': '3', 'caption': '3 Blocks' },
        { 'value': '4', 'caption': '4 Blocks' },
        { 'value': '5', 'caption': '5 Blocks' },
        { 'value': '6', 'caption': '6 Blocks' },
        { 'value': '7', 'caption': '7 Blocks' },
        { 'value': '8', 'caption': '8 Blocks' },
        { 'value': '9', 'caption': '9 Blocks' },
      ],
      'set': function(distance) { this.setDistance(distance); }.bind(this),
      'get': function() { return this.distance; }.bind(this)
    }];


  this.setDirection = function(direction)
  {
    if(direction !== undefined)
      this.direction = direction;
  }


  this.setDistance = function(distance)
  {
    if(distance !== undefined)
      this.distance = parseInt(distance);
  }


  this.setControlGroup = function(controlGroup)
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


  this.setState = function(state)
  {
    if(state) {
      if(this.direction == 'L') {
        this.x = this.baseX - 32 * this.distance;
        this.y = this.baseY;
      } else {
        this.x = this.baseX;
        this.y = this.baseY;
      }

      this.width = this.distance * 32 + 32;
      this.height = 32;
    } else {
      this.x = this.baseX;
      this.y = this.baseY;

      this.width = 32;
      this.height = 32;
    }

    this.updateCollider();
  }


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'platform',
      'direction': this.direction,
      'distance': this.distance,
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
    this.setDirection(array.direction);
    this.setControlGroup(array.controlGroup);
    this.setDistance(array.distance);
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
        collider[i].x = this.x;
        collider[i].y = this.y;
        collider[i].width = this.width;
        collider[i].height = this.height;
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
   * Updates the rock
   */
  this.update = function(keyboard)
  {
    var collision = collisionCheck({x: this.x, y: this.y, width: this.width, height:16}, this.player);

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

Platform.prototype = new BaseObject();
