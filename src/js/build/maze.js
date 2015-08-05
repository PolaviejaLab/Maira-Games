'use strict';
// Source: src/js/common/base_object.js
/** @module Common **/
/**
 * Base class for game objects.
 *
 * @class
 */
function BaseObject()
{
  this.parent = undefined;
  this.children = {};
}


/**
 * Reset object to its initiail state
 */
BaseObject.prototype.reset = function()
{
  this.resetChildren();
};


/**
 * Update (physics) state of current node.
 *
 * @param {Keyboard} keyboard - State of the keyboard
 */
BaseObject.prototype.update = function(keyboard)
{
  this.updateChildren(keyboard);
};


/**
 * Called when the object collides with another
 *
 * @param {String} name - Name of the other object
 * @param {BaseObject} object - Object that we collided with
 * @param {Object} details - Details of the collision
 */
BaseObject.prototype.onCollision = function(name, object, details)
{
};


/**
 * Draw the current node.
 *
 * @param {Context} context - Context to draw to
 */
BaseObject.prototype.draw = function(context)
{
  this.drawChildren(context);
};


/**
 * Returns the Engine object.
 */
BaseObject.prototype.getEngine = function()
{
  if(this.parent === undefined)
    return this.engine;

  return this.parent.getEngine();
};


// //////////////////////////// //
// Functions to manage children //
// //////////////////////////// //


/**
 * Return array of object names.
 */
BaseObject.prototype.getObjectNames = function()
{
	return Object.keys(this.children);
};


/**
 * Add a child object.
 *
 * @param {String} name - Name of the child object
 * @param {BaseObject} object - Object to be added
 */
BaseObject.prototype.addObject = function(name, object)
{
	object.parent = this;
	this.children[name] = object;
	this.children[name].reset();
};


/**
 * Returns whether the object exists.
 *
 * @param {String} name - Name of the object.
 * @returns {Boolean} True if the object exists, false otherwise
 */
BaseObject.prototype.hasObject = function(name)
{
  return name in this.children;
};


/**
 * Retreive a specific child object.
 *
 * @param {String} name - Name of the object to retreive
 * @returns {BaseObject} Returned object
 */
BaseObject.prototype.getObject = function(name)
{
	return this.children[name];
};


/**
 * Delete a specific child object.
 *
 * @param {String} name - Name of the object to delete
 */
BaseObject.prototype.deleteObject = function(name)
{
	delete this.children[name];
};


/**
 * Remove all child objects.
 */
BaseObject.prototype.deleteAllObjects = function()
{
	this.children = {};
};


/**
 * Reset state of child objects.
 */
BaseObject.prototype.resetChildren = function()
{
  for(var key in this.children)
    this.children[key].reset();
};


/**
 * Update (physics) state of child objects.
 *
 * @param {Keyboard} keyboard - State of the keyboard
 */
BaseObject.prototype.updateChildren = function(keyboard)
{
  for(var key in this.children)
    this.children[key].update(keyboard);
};


/**
 * Invoke the draw function on all children.
 *
 * @param {Context} context - Context to draw to
 */
BaseObject.prototype.drawChildren = function(context)
{
  for(var key in this.children)
		this.children[key].draw(context);
};

// Source: src/js/common/compat.js
/** @module Common **/
(function() {
	var requestAnimationFrame =
		window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	window.requestAnimationFrame = requestAnimationFrame;
})();


/**
 * The Date.now() function is not present in IE8 and earlier.
 */
if(!Date.now) {
	Date.now = function() {
		return new Date().getTime();
	};
}

// Source: src/js/common/engine.js
/** @module Common **/
/**
 * Game engine - responsible for render loop
 * @class
 */
function Engine()
{
}


Engine.prototype.initializeEngine = function(element, width, height, game)
{
	this.canvas = document.getElementById(element);
	if(!this.canvas) {
		console.log("getElementById(" + element + ") returned " + this.canvas);
		throw new Error("Canvas element passed to engine initialization is invalid.");
	}

	this.context = this.canvas.getContext("2d");
	if(!this.context)
		throw new Error("Could not create 2d context during engine initialization.");

	this.game = game;
	this.game.engine = this;

	this.setSize(width, height);

	this.input = new Keyboard();
	this.mouse = new Mouse(this.canvas);

	this.editMode = false;
	this.debugMode = false;

	window.requestAnimationFrame(this.update.bind(this));

	//this.game.initialize();
	this.game.reset();
};


/**
 * Returns width of the game window
 */
Engine.prototype.getWidth = function()
{
	return this.canvas.width;
};


/**
 * Returns height of the game window
 */
Engine.prototype.getHeight = function()
{
	return this.canvas.height;
};


/**
 * Set size of the game window.
 *
 * @param {Number} width - Width of the game window
 * @param {Number} height - Height of the game window
 */
Engine.prototype.setSize = function(width, height)
{
	this.canvas.width = width;
	this.canvas.height = height;
};


/**
 * Update game state and then render frame
 */
Engine.prototype.update = function(timestamp)
{
	this.timestamp = timestamp;

	/**
	 * Handle input, update physics and scrolling
	 */
	this.game.update(this.input);

	/**
	 * Redraw entire scene
	 */
	this.context.save();
	this.game.draw(this.context);
	this.context.restore();

	window.requestAnimationFrame(this.update.bind(this));
};

// Source: src/js/common/input.js
/** @module Common **/
/**
 * Catches keyboard events and provides an array with states (up / down)
 *
 * Example:
 *  var keyboard = Keyboard();
 *  if(keyboard.keys[keyboard.KEY_UP])
 *    console.log("The up key is currently being pressed.");
 *
 * @class
 */
function Keyboard()
{
	this.KEY_BACKSPACE = 8;
	this.KEY_TAB = 9;

	this.KEY_ENTER = 13;
	this.KEY_SHIFT = 16;
	this.KEY_CTRL = 17;
	this.KEY_ALT = 18;

	this.KEY_PAUSE = 19;
	this.KEY_CAPS = 20;
	this.KEY_ESCAPE = 27;

	this.KEY_SPACE = 32;

	this.KEY_LEFT = 37;
	this.KEY_UP = 38;
	this.KEY_RIGHT = 39;
	this.KEY_DOWN = 40;

	this.KEY_A = 65;
	this.KEY_B = 66;
	this.KEY_C = 67;
	this.KEY_D = 68;
	this.KEY_E = 69;
	this.KEY_F = 70;
	this.KEY_G = 71;
	this.KEY_H = 72;
	this.KEY_I = 73;
	this.KEY_J = 74;
	this.KEY_K = 75;
	this.KEY_L = 76;
	this.KEY_M = 77;
	this.KEY_N = 78;
	this.KEY_O = 79;
	this.KEY_P = 80;
	this.KEY_Q = 81;
	this.KEY_R = 82;
	this.KEY_S = 83;
	this.KEY_T = 84;
	this.KEY_U = 85;
	this.KEY_V = 86;
	this.KEY_W = 87;
	this.KEY_X = 88;
	this.KEY_Y = 89;
	this.KEY_Z = 90;

	this.keys = {};

	this.keydown = function(event) {
		this.keys[event.keyCode] = true;
	};

	this.keyup = function(event) {
		this.keys[event.keyCode] = false;
	};

	document.body.addEventListener("keydown", this.keydown.bind(this));
	document.body.addEventListener("keyup", this.keyup.bind(this));
}


/**
 * Creates a new event to dispatch on mouse move, click, or touch
 *
 * @private
 * @param {string} name - Name of the event
 * @param {string} type - Type of the event, typically mouse or touch
 * @param {Event} event - Original event
 * @param {Canvas} canvas - Canvas object, coordinates will be relative to this
 *
 * @returns {CustomEvent} Custom event to dispatch
 */
function createMoveEvent(name, type, event, canvas, down)
{
	var rect = canvas.getBoundingClientRect();

	return new CustomEvent(name, {
		detail: {
			type: type,
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
			buttons: event.buttons,
			down: down
		},

		bubbles: false,
		cancellable: true
	});
}


/**
 * Catches mouse movement and touch events and dispatches a
 * common event to the specified element;
 *
 * @class
 * @param {Canvas} canvas - Canvas element to dispatch events to
 */
function Mouse(canvas)
{
	// Make sure canvas is defined
	if(canvas === undefined)
		throw new Error("Parameter 'canvas' is undefined in Mouse() constructor.");

	this.canvas = canvas;

	this.mouseclick = function(event)
	{
		var evt = createMoveEvent("game-move", "mouse", event, this.canvas, true);
		this.canvas.dispatchEvent(evt);
		event.preventDefault();
	};

	this.mousemove = function(event) {
		var evt = createMoveEvent("game-move", "mouse", event, this.canvas, false);
		this.canvas.dispatchEvent(evt);
		event.preventDefault();
	};

	this.touchmove = function(event) {
		var first = event.changedTouches[0];
		first.buttons = 0;

		var evt = createMoveEvent("game-move", "touch", first, this.canvas, false);
		this.canvas.dispatchEvent(evt);
		event.preventDefault();
	};

	this.touchstart = function(event) {
		var first = event.changedTouches[0];
		first.buttons = 0;

		var evt = createMoveEvent("game-move", "touch", first, this.canvas, false);
		this.canvas.dispatchEvent(evt);
		event.preventDefault();		
	};

	this.element = this.canvas;

	this.element.addEventListener("mousemove", this.mousemove.bind(this));
	this.element.addEventListener("touchmove", this.touchmove.bind(this), true);
	this.element.addEventListener("mousedown", this.mouseclick.bind(this));
	this.element.addEventListener("touchstart", this.touchstart.bind(this));
}

// Source: src/js/common/sink.js
/** @module Common **/
/**
 * Accepts and buffers player movement data
 * and periodically sends it to the data sink.
 *
 * @class
 * @param {Integer} Game identifier
 * @param {String} Name of the current level
 */
function Sink(sinkAddress)
{
  this.sendingInProgress = false;
  this.sinkAddress = sinkAddress;

  this.transmitAutomatically = true;
  this.transmitEvery = 1;

  this.id = 0;
  this.buffer = {};


  /**
   * Append data to buffer.
   *
   * @param {Object} Object to send
   * @returns {Integer} Id of the transmitted move
   */
  this.appendData = function(data)
  {
    data.id = this.id;
    this.buffer[this.id] = data;
    this.id++;

    if(this.transmitAutomatically && (this.id % this.transmitEvery) === 0)
      this.transmitData();

    return data.id;
  };


  /**
   * Explicitly attempt to transmit data to server.
   */
  this.transmitData = function()
  {
    if(this.sendingInProgress)
      return;

    this.sendingInProgress = true;

    // Send moves to server
    jQuery.ajax({
      url: this.sinkAddress,
      data: JSON.stringify(this.buffer),
      contentType: 'text/plain',
      dataType: 'json',
      method: 'POST'
    }).done(function(result) {
      // Remove moves from buffer that were successfully sent
      for(var i in result) {
        if(result[i] in this.buffer)
          delete(this.buffer[ result[i] ]);
      }

      this.sendingInProgress = false;
    }.bind(this)).fail(function() {
      this.sendingInProgress = false;
    }.bind(this));
  };
}

// Source: src/js/common/url.js
/** @module Common **/
/**
 * Returns the address of the current web page
 * @returns {String} Address of the web page
 */
function getAddress(url)
{
	if(typeof url === 'undefined')
		url = window.location.href;

	var parts = url.split(/[\?]+/);

	return parts[0];
}


/**
 * Returns the value of a field from the query string
 *
 * @param {String} field - Name of the field
 * @param {String} default - Optional default value
 * @param {String} url - Optional string containing the URL to parse
 * @returns {String} Value of the field or false if the key was not found.
 */
function getQueryField(field, url) {
	return getQueryFieldWithDefault(field, undefined, url);
}


/**
 * Returns the value of a field from the query string
 *
 * @param {String} field - Name of the field
 * @param {String} default - Optional default value
 * @param {String} url - Optional string containing the URL to parse
 * @returns {String} Value of the field or false if the key was not found.
 */
function getQueryFieldWithDefault(field, deflt, url) {
	if(typeof url === 'undefined')
		url = window.location.href;

	var fieldValues = getQueryFields(url);

	if(field in fieldValues)
		return fieldValues[field];

	return deflt;
}


/**
 * Returns the values for all fields in the query string
 * @param {String} url - URL that contains the query string
 */
function getQueryFields(url)
{
	var fieldValues = url.split(/[\?&]+/);
	var values = {};

	for(var i = 1; i < fieldValues.length; i++)
	{
		var fieldValue = fieldValues[i].split("=");
		values[fieldValue[0]] = fieldValue[1];
	}

	return values;
}


/**
 * Changes the query string
 *
 * @param {Object} Associative array with field to update
 * @returns {String} Updates query string
 */
function updateQueryString(updates, url)
{
	if(typeof url === 'undefined')
		url = window.location.href;

	// Extract all field-value pairs
  var fieldValues = getQueryFields(url);
	var field;

	// Copy updates into fieldValues object
	for(field in updates) {
		fieldValues[field] = updates[field];
	}

	var queryString = getAddress(url);
	var first = true;

	for(field in fieldValues) {
		queryString += (first?"?":"&") + field + "=" + fieldValues[field];
		first = false;
	}

	return queryString;
}

// Source: src/js/maze/controls.js
/** @module Maze **/
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

// Source: src/js/maze/fullscreen.js
/** @module Maze **/
document.cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;

document.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    case 13: // ENTER. ESC should also take you out of fullscreen by default.
      e.preventDefault();
      document.cancelFullScreen();
      break;
    case 70: // f
      enterFullscreen();
      break;
  }
}, false);


/**
 * Create onFullScreenEnter event when entering fullscreen
 */
function onFullScreenEnter() {
  elem.onwebkitfullscreenchange = onFullScreenExit;
  elem.onmozfullscreenchange = onFullScreenExit;

  var event = new CustomEvent("onFullScreenEnter", {
    bubbles: false,
  	cancellable: true
  });

  document.dispatchEvent(event);
}


/**
 * Create onFullScreenExit event when exiting fullscreen
 */
function onFullScreenExit() {
  var event = new CustomEvent("onFullScreenExit", {
    bubbles: false,
  	cancellable: true
  });

  document.dispatchEvent(event);
}


/**
 * Enter fullscreen mode
 *
 * Note: FF nightly needs about:config full-screen-api.enabled set to true.
 */
function enterFullscreen() {
  var elem = document.querySelector("#fullscreen");

  if(!elem) {
    console.log("Could not find element");
    return;
  }

  elem.onwebkitfullscreenchange = onFullScreenEnter;
  elem.onmozfullscreenchange = onFullScreenEnter;
  elem.onfullscreenchange = onFullScreenEnter;

  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else {
      elem.requestFullscreen();
    }
  }

  document.getElementById('enter-exit-fs').onclick = exitFullscreen;
}


/**
 * Explicitly exit fullscreen mode
 */
function exitFullscreen() {
  document.cancelFullScreen();
  document.getElementById('enter-exit-fs').onclick = enterFullscreen;
}

// Source: src/js/maze/game.js
/** @module Maze **/
/**
 * Main class for maze game
 *
 * @class
 * @augments Engine
 */
function Game()
{
}

Game.prototype = new BaseObject();

// Source: src/js/maze/level.js
/** @module Maze **/
/**
 * Represents the maze layout
 *
 * @class
 */
function Level()
{
	// Server to load levels from
	//this.server = "http://www.ivarclemens.nl/platform_game/ldb/";

	this.levelMap = [[3]];

	if(getQueryField("player") == 1)
		this.levelMap = level1;

	if(getQueryField("player") == 2)
		this.levelMap = level2;

	if(getQueryField("player") == 3)
		this.levelMap = level3;

	this.reset = function()
	{
		this.bombImage = new Image();
		this.bombImage.src = "images/bomb.png";

		if('game' in this) {
			var bounds = {
					x: 0,
					y: 0,
					width: (this.getWidth()-1)/2 * widthspace +  (this.getWidth()+1)/2 * widthwall,
					height: (this.getHeight()-1)/2 * widthspace +  (this.getHeight()+1)/2 * widthwall
				};
			this.game.setLevelBounds(bounds);

			this.game.setSize(bounds.width, bounds.height);
		}
	}


	this.update = function(input)
	{
	}


	/**
	 * Draw entire level
	 */
	this.draw = function(context)
	{
		for(var i = 0; i < this.levelMap.length; i++) {
			for(var j = 0; j < this.levelMap[0].length; j++) {
				var x, y, w, h;

				if(j % 2 == 0) {
					x = j*(widthspace+widthwall)/2;
					w = widthwall;
				}	else {
					x = (j-1)*(widthspace+widthwall)/2 + widthwall;
					w = widthspace;
				}

				if(i % 2 == 0) {
					y = i*(widthspace+widthwall)/2;
					h = widthwall;
				} else {
					y = (i-1)*(widthspace+widthwall)/2 + widthwall;
					h = widthspace;
				}

				context.fillStyle = '#FFFFFF';
				context.fillRect(x, y, w, h);

				if(this.levelMap[i][j] == 1){
					context.fillStyle="#000000";
					context.fillRect(x, y, w, h);
				}

				if(this.levelMap[i][j] == 2){
					context.drawImage(this.bombImage, x, y, w, h);
				}
			}
		}
	}
}


Level.prototype = new BaseObject();


Level.prototype.getHeight = function()
{
	return this.levelMap.length;
}


Level.prototype.getWidth = function()
{
	return this.levelMap[0].length;
}


/**
 * Sets the sprite at a specific block
 */
Level.prototype.setSprite = function(coords, sprite)
{
	// Check invalid coordinates
	if(coords.x < 0 || coords.y < 0)
		return false;

	// Expand level if not big enough
	if(this.levelMap.length < coords.y ||
	   this.levelMap[0].length < coords.x) {

		// Required dimensions
		var height = Math.max(1 + coords.y, this.levelMap.length);
		var width = Math.max(1 + coords.x, this.levelMap[0].length);

		for(var i = 0; i < height; i++) {
			if(i >= this.levelMap.length)
				this.levelMap[i] = [];

			for(var j = this.levelMap[i].length; j < width; j++)
				this.levelMap[i][j] = 0;
		}
	}

	this.levelMap[coords.y][coords.x] = sprite;
}


/**
 * Clears the current level, filling it completely with air
 */
Level.prototype.resetLevel = function(width, height)
{
	this.levelMap = [];

	for(var j = 0; j < height; j++) {
		this.levelMap[j] = [];

		for(var i = 0; i < width; i++) {
			if(i == 0 || j == 0 || i == (width -  1) || j == (height - 1)) {
				this.levelMap[j][i] = 1;
			} else {
				this.levelMap[j][i] = 0;
			}
		}
	}

	this.reset();
}


/**
 * Loads the level with the given name from the server
 */
Level.prototype.loadLevel = function(name)
{
	jQuery.ajax({
		url: this.server + "/get_level.php?name=" + name,
		dataType: 'json'
	}).done(function(data) {
		this.levelMap = data;
		this.reset();
	}.bind(this));
}


/**
 * Save the level to the server
 */
Level.prototype.saveLevel = function(name)
{
	jQuery.ajax({
		url:  this.server + "/set_level.php?name=" + name,
		data: JSON.stringify(this.levelMap),
		contentType: 'text/plain',
		method: 'POST'
	});
}

// Source: src/js/maze/player.js
/** @module Maze **/
/**
 * Object representing the player in the maze game
 * @class
 */
function Player()
{
	// Depends on sprite
	this.width = 32;
	this.height = 46;

	var sessionId = parseInt(gameStart).toString(36 | 0).toUpperCase();

	this.sink = new Sink(datasink + "?game=MG&session=" + sessionId + "&level=" + playerId + "&user=" + userId + "&debug=false");


	/**
	 * Sets up the player object
	 */
	this.reset = function()
	{
		// Find player start position
		var level = this.parent.getObject("level");

		for(var i = 0; i < level.levelMap.length; i++) {
			for(var j = 0; j < level.levelMap[0].length; j++) {
				if (level.levelMap[i][j] == 3){
					this.x = j;
					this.y = i;
				}
			}
		}

		// Load sprite
		this.playerImage = new Image();
		this.playerImage.src = "images/player.png";
	}


	/**
	 * Handles player movement
	 * @param {Keyboard} Object containing keyboard state
	 */
	this.update = function(input)
	{
	}


	/**
	 * Attempt to moves the player one block in the specified direction
	 * @param {number} Movement in X direction (left/right)
	 * @param {number} Movement in Y direction (up/down)
	 */
	this.moveDirection = function(dx, dy)
	{
		// Normalize delta
		if(dx != 0)
			dx /= Math.abs(dx);
		if(dy != 0)
			dy /= Math.abs(dy);

		// Attempt to move player
		return this.move(this.x + dx * 2, this.y + dy * 2)
	}


	/**
	 * Move player, returns whether the proposed move is valid
	 * @param {number} Target X coordinate
	 * @param {number} Target Y coordinate
	 */
	this.move = function(x, y)
	{
		var level = this.parent.getObject("level");

		var delta = Math.abs(this.x - x) + Math.abs(this.y - y);

		if(delta != 2)
			return false;

		// Set player angle
		if(this.x < x)
			this.playerAngle = 0;
		else if(this.x > x)
			this.playerAngle = 180;
		else if(this.y < y)
			this.playerAngle = 90;
		else if(this.y > y)
			this.playerAngle = -90;

		// Check if move is valid
		if(level.levelMap[(this.y + y) / 2][(this.x + x) / 2] == 1)
			return false;

		if(level.levelMap[y][x] == 2)
			return false;


		// Player has moved
		if(this.x != x || this.y != y)
		{
			this.x = x;
			this.y = y;

			// Store move in the move-buffer
			var move = {
				timestamp: Date.now() / 1000,
				x: x,
				y: y
			};

			this.sink.appendData(move);

			return true;
		}

		return false;
	}



	/**
	 * Draw the correct sprite based on the current state of the player
	 */
	this.draw = function(context)
	{
		var x, y, w, h;

		if(this.x % 2 == 0){
			x = this.x*(widthspace+widthwall)/2;
			w = widthwall;
		}
		else{
			x = (this.x-1)*(widthspace+widthwall)/2 + widthwall;
			w = widthspace;
		}
		if(this.y % 2 == 0){
			y = this.y*(widthspace+widthwall)/2;
			h = widthwall;
		}
		else{
			y = (this.y-1)*(widthspace+widthwall)/2 + widthwall;
			h = widthspace;
		}

		context.save();
		context.translate(x + w / 2, y + h / 2);
		context.rotate(this.playerAngle * Math.PI / 180.0);

		context.drawImage(this.playerImage, -w / 2, -h / 2, w, h);
		context.restore();
	}
}


Player.prototype = new BaseObject();

//# sourceMappingURL=maze.js.map