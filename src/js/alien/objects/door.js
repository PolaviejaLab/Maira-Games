/** @module Alien **/
"use strict";

/**
 * Creates new door object.
 *
 * @class
 * @classdesc Object representing a door in the alien girl game.
 */
function Door()
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
    this.state = state;
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
      'type': 'door',
      'direction': this.direction,
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

    if(collision && this.direction == 'S') {
      // Find target
      for(var key in this.parent.children) {
        var child = this.parent.children[key];

        if(child.type == 'door' && child.controlGroup == this.controlGroup && child.direction == 'T')
        {
          this.player.x = child.x;
          this.player.y = child.y;
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
  this.draw = function(context)
  {
    var box = { 'x': this.x, 'y': this.y - 32, 'width': 32, 'height': 32 };

    if(this.state) {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
      this.parent.spriteManager.drawSprite(context, box, this.sprite + 1, 0);
    } else {
      this.parent.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
      this.parent.spriteManager.drawSprite(context, box, this.sprite + 3, 0);
    }

    if(this.getEngine().debugMode) {
      var collider = this.getComponent("collider");
      collider.draw(context);
    }
  }
}

Door.prototype = new BaseObject();
