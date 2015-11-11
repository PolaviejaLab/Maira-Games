/** @module Maze **/
"use strict";

/**
 * Handles different ways to handle touch events in the maze game.
 * @class
 */
function Controls()
{
  this.x = 1144;
  this.y = 100;

  this.maxRadius = 70;
  this.minRadius = 15;

  // Position of initial touch
	this.initialTouchPosition = {x: 0, y: 0};
  this.lastTouchTime = 0;

  this.lastMouseMoveTime = 0;
  this.lastKeyboardMoveTime = 0;
  this.repeatInterval = 200;

  // Mouse movement mode
	this.mode = "direction";
	this.modeWedge = true;


  this.reset = function()
  {
    this.mode = getQueryField("control");

    if(!this.mode)
      this.mode = 'direction';

    console.log("Using control mode: " + this.mode);

    this.getEngine().canvas.addEventListener("game-move", this.mousemove.bind(this));
    this.player = this.parent.getObject("player");
  }


  /**
   * Handle keyboard-based movements.
   */
  this.handleKeyboardUpdate = function(input)
  {
    // In case all keys are up, reset the repeat timer
    if(!input.keys[input.KEY_LEFT] && !input.keys[input.KEY_RIGHT] &&
       !input.keys[input.KEY_DOWN] && !input.keys[input.KEY_UP])
       this.lastKeyboardMoveTime = 0;

    // Make sure we are within the repeat interval
    var delta = Date.now() - this.lastKeyboardMoveTime;

    if(delta < this.repeatInterval)
      return;

    // Keep track of whether a move was made in this interval
    var moved = false;
    var player = this.player;

    // Attempt to move after keypresses
		if(!moved && input.keys[input.KEY_LEFT])  moved |= player.moveDirection(-1,  0);
		if(!moved && input.keys[input.KEY_RIGHT]) moved |= player.moveDirection( 1,  0);
		if(!moved && input.keys[input.KEY_UP])    moved |= player.moveDirection( 0, -1);
		if(!moved && input.keys[input.KEY_DOWN])  moved |= player.moveDirection( 0,  1);

    if(moved)
      this.lastKeyboardMoveTime = Date.now();
  }


  /**
   * Move mouse using a control circle
   */
  this.moveMouseControlCircle = function(event)
  {
    var pos = { x: event.detail.x - this.x, y: event.detail.y - this.y };
    var dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);

    // Only allow events within control circle
    if(dist < this.minRadius || dist > this.maxRadius)
      return;

    // Force a minimum of X ms between moves
    var delta = Date.now() - this.lastMouseMoveTime;

    if(delta < this.repeatInterval)
      return;

    // Normalize direction
    var move;
    if(Math.abs(pos.x) > Math.abs(pos.y))
      move = { x: Math.sign(pos.x), y: 0 };
    else
      move = { x: 0, y: Math.sign(pos.y) };

    // Perform movement
    if(this.player.moveDirection(move.x, move.y))
      this.lastMouseMoveTime = Date.now();
  }


  /**
	 * Move the player along with the (dragging) mouse movement
	 */
	this.moveMouseDirection = function(event)
	{
		if(event.detail.type == 'mouse' && event.detail.buttons != 1) {
			this.lastTouchTime = 0;
			return false;
		}

    var widthwall = this.parent.widthwall;
    var widthspace = this.parent.widthspace;
		var width = (widthspace + widthwall);

		// Compute age of last touch event
		var age = Date.now() - this.lastTouchTime;
		this.lastTouchTime = Date.now();

		// If no touch has been registered for the last second, start again
		if(age > 1000) {
			this.initialTouchPosition = {
				x: event.detail.x / width,
				y: event.detail.y / width};
			return false;
		}

		// Compute mouse movement direction
		var delta = {
			x: event.detail.x / width - this.initialTouchPosition.x,
			y: event.detail.y / width - this.initialTouchPosition.y
		};


		if(Math.abs(delta.x) > Math.abs(delta.y)) {
			if(Math.abs(delta.x) >= 1.0) {
				this.player.moveDirection(delta.x, 0);
				this.initialTouchPosition.x += delta.x;
			}
		} else {
			if(Math.abs(delta.y) >= 1.0) {
				this.player.moveDirection(0, delta.y);
				this.initialTouchPosition.y += delta.y;
			}
		}
	}


  /**
	 * Move the player to the position of a click / touch
	 */
	this.moveMouseCoordinates = function(event)
	{
		if(event.detail.type == 'mouse' && event.detail.buttons != 1)
			return false;

    var widthwall = this.parent.widthwall;
    var widthspace = this.parent.widthspace;
		var width = (widthspace + widthwall);

		// Compute position in grid
		var x = event.detail.x / width;
		var y = event.detail.y / width;

		// Ignore walls
		if(x - Math.floor(x) < widthwall / width)
			return false;

		if(y - Math.floor(y) < widthwall / width)
			return false;

		// Round grid position and convert to level coordinates
		x = Math.floor(x) * 2 + 1;
		y = Math.floor(y) * 2 + 1;

		if(this.modeWedge) {
			var dx = x - this.player.x;
			var dy = y - this.player.y;

			x = this.player.x;
			y = this.player.y;

			if(Math.abs(dy) > Math.abs(dx)) {
				if(dy < 0)
					y = y - 2;
				else if(dy > 0)
					y = y + 2;
			} else {
				if(dx < 0)
					x = x - 2;
				else if(dx > 0)
					x = x + 2;
			}
		}

		var timeSinceLastMove = Date.now() - this.lastMouseMoveTime

		if(!this.modeWedge || timeSinceLastMove > this.repeatInterval) {
			var result = this.player.move(x, y);

			if(result)
				this.lastMouseMoveTime = Date.now();

			return result;
		}
	}


  this.update = function(input)
  {
    this.handleKeyboardUpdate(input);
  }


  /**
	 * Handle mouse move
	 */
	this.mousemove = function(event)
	{
		if(this.mode == "coord" && this.moveMouseCoordinates(event))
			return true;

		if(this.mode == "direction" && this.moveMouseDirection(event))
			return true;

    if(this.mode == "control" && this.moveMouseControlCircle(event))
      return true;

		return false;
	}


  this.draw = function(context)
  {
    if(this.mode == "control") {
      context.beginPath();
      context.arc(this.x, this.y, this.maxRadius, 0, 2 * Math.PI, false);
      context.fillStyle = 'white';
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = 'red';
      context.stroke();

      context.beginPath();
      context.arc(this.x, this.y, this.minRadius, 0, 2 * Math.PI, false);
      context.fillStyle = 'red';
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = 'red';
      context.stroke();
    }
  }
}


Controls.prototype = new BaseObject();
