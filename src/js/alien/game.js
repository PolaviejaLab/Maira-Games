/** @module Alien **/
"use strict";


/**
 * Creates main class for alien girl game.
 *
 * @class
 * @classdesc Alien girl game.
 * @augments Engine
 * @param {String} element - Name of canvas element to draw to
 * @param {number} width - Required width of canvas element
 * @param {number} height - Required height of canvas element
 */
function Game()
{
  this.levelBounds = {x: 0, y: 0, width: 32, height: 32 };
  this.spriteManager = new SpriteManager();  
  this.engine = false;
  this.scroll = {x: 0, y: 0};
  this.deadzone = {w: 128};
}


Game.prototype = new BaseObject();


Game.prototype.reset = function()
{
  this.resetChildren();
};


Game.prototype.update = function(keyboard)
{
  this.updateTranslation();

  if(this.editMode)
    return;

  this.updateChildren(keyboard);
};


Game.prototype.draw = function(context)
{
  if(!this.engine)
    throw new Error("Game: Engine object is invalid");

  var width = this.engine.getWidth();
  var height = this.engine.getHeight();

  //context.imageSmoothingEnabled = true;
  //context.scale(0.25, 0.25);

  context.clearRect(0, 0, width, height);
  context.translate(-this.scroll.x, -this.scroll.y);

  this.drawChildren(context);
};


/**
 * Sets the boundaries of the level
 *
 * @param {Array} bounds - Bounaries of the level
 */
Game.prototype.setLevelBounds = function(bounds)
{
	this.levelBounds = bounds;
};


/**
 * When the game is over, reset all objects
 * which effectively restarts the game.
 */
Game.prototype.gameover = function()
{
  // Reset all objects to their default states
  this.reset();
};


/**
 * Start edit mode
 */
Game.prototype.startEditMode = function()
{
	this.editMode = true;

	// Reset all objects to their default states
	for(var key in this.objects)
		this.objects[key].setup();
};


/**
 * Updates translation offset in canvas when the player exits the dead-zone.
 */
Game.prototype.updateTranslation = function()
{
  var input = this.engine.input;
  var width = this.engine.getWidth();
  var height = this.engine.getHeight();

	// Do not use player to scroll in edit mode
	if(this.editMode) {
		return;
	}

  if(!this.hasObject('player_1'))
    return;

	var playerX = this.getObject('player_1').x;

	if(width >= this.levelBounds.width) {
		this.scroll.x = (width - this.levelBounds.width) / 2 - this.levelBounds.x;
    this.scroll.y = this.levelBounds.y;
    return;
  }


	// Compute boundaries of dead-zone in screen coordinates
	var deadzone_x_min = (width - this.deadzone.w) / 2;
	var deadzone_x_max = (width + this.deadzone.w) / 2;

	// Computer player position in screen coordinates
	var player_x_game = playerX - this.scroll.x;

	// Update scrolling
	if(player_x_game > deadzone_x_max) {
		this.scroll.x += player_x_game - deadzone_x_max;
	} else if(player_x_game < deadzone_x_min) {
		this.scroll.x += player_x_game - deadzone_x_min;
	}

	// Make sure we do not scroll past beginning/end of level
	if(this.scroll.x < this.levelBounds.x)
		this.scroll.x = this.levelBounds.x;
	if(this.scroll.x > (this.levelBounds.x + this.levelBounds.width) - width) {
		this.scroll.x = (this.levelBounds.x + this.levelBounds.width) - width;
  }

  // Not used in maze
	this.scroll.y = this.levelBounds.y;
};
