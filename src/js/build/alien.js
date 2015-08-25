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

// Source: src/js/alien/alien.js

/**
 * Loads the list of levels into a form element.
 * @param {String} element <select> Element to insert levelnames into.
 * @param {String} selected Selected item.
 */
function updateLevelSelector(element, selected)
{
  jQuery.ajax(server + "ldb/list_levels.php", { dataType: 'json'}).done(function(result) {
    for(var i = 0; i < result.length; i++) {
      var list = $(element);

      var li = $("<option/>")
        .appendTo(list)
        .attr('value', result[i].name)
        .text(result[i].name[0].toUpperCase() + result[i].name.slice(1));

      if(selected == result[i].name)
        li.attr('selected', 'selected');
    }
  }.bind(this));
}


/**
 * Parses a string into a boolean, leaving undefined and boolean values alone
 */
function parseBool(str)
{
  if(str === undefined || str === true || str === false)
    return str;

  str = str.toLowerCase();

  if(str == 'true' || str == 'yes' || str == 'on' || str == '1')
    return true;

  return false;
}


/**
 * Returns an object with options from the query string.
 */
function getOptionsFromQuery()
{
  var options = {
    editMode:  parseBool(getQueryField("edit")),
    debugMode: parseBool(getQueryField("debug")),
    levelName: getQueryField("level"),
    gameId:    getQueryField("game"),
    userId:    getQueryField("user")
  }

  return options;
}

// Source: src/js/alien/editor.js
/** @module Alien **/
/**
 * Creates a new level edior object.
 *
 * @class
 * @classdesc Level editor for alien girl game.
 */
function Editor(game)
{
	this.game = game;
	this.game.startEditMode();

	this.offset = {x: 0, y: 0};

	this.selectedObject = false;
	this.currentSprite = 'l';

	this.setupDone = false;

	this.types = {};
	for(var i = 0; i < spriteTable.length; i++) {
		if('type' in spriteTable[i]) {
			var key = spriteTable[i].key;
			this.types[key] = spriteTable[i].type;
		}
	}
}


Editor.prototype = new BaseObject();


Editor.prototype.reset = function()
{
	var engine = this.getEngine();

	if(!this.setupDone && engine) {
		this.game.engine = engine;
		this.setupMouse(engine.canvas);
		this.setupDone = true;
	}
};


/**
 * Handle keyboard input, scroll on arrow keys
 */
Editor.prototype.update = function(input)
{
	if(input.keys[input.KEY_LEFT])
		this.game.scroll.x -= 8;
	if(input.keys[input.KEY_RIGHT])
		this.game.scroll.x += 8;

	if(this.game.scroll.x < 0)
		this.game.scroll.x = 0;
};

/**
 * Change the currently active sprite
 *
 * @param {number} sprite - ID of sprite to make active
 */
Editor.prototype.setSprite = function(sprite)
{
	this.currentSprite = sprite;
};


Editor.prototype.draw = function(context)
{
	this.game.draw(context);

	if(this.selectedObject) {
		context.beginPath();
		context.rect(this.selectedObject.x, this.selectedObject.y, this.selectedObject.width, this.selectedObject.height);
		context.lineWidth = 1;
		context.strokeStyle = 'red';
		context.stroke();
	}
};


/************************************
 * Handle mouse movement and clicks *
 ************************************/


/**
 * Generate unique name for new object given a base name
 *
 * @param {String} base - Initial part of the name
 * @return {String} Unique identifier that contains the base name
 */
Editor.prototype.generateName = function(base)
{
	var keys = this.game.getObjectNames();
	var max_i = 0;

	for(var i = 0; i < keys.length; i++) {
		var first = keys[i].slice(0, base.length + 1);

		if(first == base + "_") {
			var last = parseInt(keys[i].slice(base.length + 1));

			if(last > max_i)
				max_i = last;
		}
	}

	return base + "_" + (max_i + 1);
};


/**
 * Called on mouse movement, paints active sprite when
 * moving the mouse while holding the left button. Removes
 * the sprite when moving the mouse while holding the right button.
 *
 * @private
 * @param {Event} event - Mouse movement event
 */
Editor.prototype.mouseMove = function(event)
{
	var keys = this.game.getObjectNames();
	var coords = { x: this.game.scroll.x + event.detail.x, y: event.detail.y };

	/**
	 * Move selected object if we are dragging it
	 */
	if(this.dragging && !event.detail.down) {
		if(event.detail.buttons == 1) {
			this.selectedObject.x = coords.x - this.offset.x;
			this.selectedObject.y = coords.y - this.offset.y;
		} else {
			this.dragging = false;
		}

		return;
	}

	/**
	 * Check whether an object has been clicked or dragging of an
	 * object has been initiated. We start with the latest object
	 * because that one will be renderen on-top of everything else.
	 */
	if(event.detail.down) {
		for(var i = keys.length - 1; i >= 0; i--) {
			var object = this.game.getObject(keys[i]);

			if(inBox(coords.x, coords.y, object)) {
				this.selectedObject = object;

				if(event.detail.buttons & 1) {
					this.dragging = true;

					this.offset.x = coords.x - object.x;
					this.offset.y = coords.y - object.y;
				} else if(event.detail.buttons & 2) {
					this.game.deleteObject(keys[i]);
				}

				return;
			}
		}
	}

	/**
	 * The level itself has been clicked, deselect all objects
	 */
	if(event.detail.down)
		this.selectedObject = false;

	if(this.currentSprite in this.types) {
		if(event.detail.down && event.detail.buttons & 1) {
			var type = this.types[this.currentSprite];

			var object = constructors[type]({ x: coords.x, y: coords.y, sprite: this.currentSprite});

			var object_name = this.generateName(type);
			this.game.addObject(object_name, object);
		}
	} else {

		/**
	 	 * Put the (normal) sprite into the level
	 	 */
		coords.x = Math.floor(coords.x / 32);
		coords.y = Math.floor(coords.y / 32);

		if(event.detail.buttons & 1)
			this.game.getObject("level").setSprite(coords, this.currentSprite);
		else if(event.detail.buttons & 2)
			this.game.getObject("level").setSprite(coords, 0);
	}
}


/**
 * Sets up mouse movement callback
 *
 * @private
 */
Editor.prototype.setupMouse = function(canvas)
{
	this.mouse = new Mouse(canvas);

	/**
	 * Disable context-menu on right click
	 */
	document.addEventListener("contextmenu",
		function(event) {
			event.preventDefault();
			return false;
		}, false);

	canvas.addEventListener("game-move", this.mouseMove.bind(this));
}

// Source: src/js/alien/game.js
/** @module Alien **/
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

// Source: src/js/alien/graphics.js
/** @module Alien **/
/**
 * Create a new sprite manager object.
 *
 * @class
 * @classdesc Manages sprites in the alien girl game.
 */
function SpriteManager()
{
	this.sprites = {};
	var imageMap = {};

	/**
	 * Returns whether a given sprite is valid.
	 *
	 * @param {String} name - Name of the sprite to check
	 * @return {boolean} True if valid, false if not
	 */
	this.isSpriteValid = function(name)
	{
		return (name in this.sprites);
	}


	/**
	 * Draw a sprite to the context
	 *
	 * @param {Context} context - Context to draw to
	 * @param {Object} box - Bounding box {x, y, width, height} to draw to
	 * @param {String} name - Name of the sprite to draw
	 * @param {number} frame - Number of the frame to draw
	 * @param {Function} transform - Special transform function to call before drawing
	 */
	this.drawSprite = function(context, box, name, frame, transform)
	{
		var sprite = this.sprites[name];

		if(!sprite)
			throw new Error("Could not find sprite " + name + " " + name.toString(16));

		if(frame in sprite)
			sprite = sprite[frame];

		if(transform) {
			context.save();
			context.translate(box.x + box.width / 2, box.y + box.height / 2);

			transform(context);

			context.drawImage(sprite, -box.width / 2, -box.height / 2, box.width, box.height);
			context.restore();
		} else {
			context.drawImage(sprite, box.x, box.y, box.width, box.height);
		}
	}
}


SpriteManager.prototype.getFrameCount = function(sprite)
{
	if(!(sprite in this.sprites))
		return;

	return this.sprites[sprite].length;
}


/**
 * Returns the width of a sprite.
 *
 * @param {number} sprite - Number of the sprite.
 * @returns {number} Width in pixels.
 */
SpriteManager.prototype.getWidth = function(sprite)
{
	if(!(sprite in this.sprites))
		return;

	if(this.sprites[sprite].length > 1)
		return this.sprites[sprite][0].width;
	return this.sprites[sprite].width;
}


/**
 * Returns the height of a sprite.
 *
 * @param {number} sprite - Number of the sprite.
 * @returns {number} Height in pixels.
 */
SpriteManager.prototype.getHeight = function(sprite)
{
	if(!(sprite in this.sprites))
		return;

	if(this.sprites[sprite].length > 1)
		return this.sprites[sprite][0].height;
	return this.sprites[sprite].height;
}


SpriteManager.prototype.loadImage = function(key, frame, source)
{
	return new Promise(function(resolve, reject) {
		// Create array for frame if it does not already exist
		if(!(key in this.sprites))
			this.sprites[key] = [];

		this.sprites[key][frame] = new Image();

		this.sprites[key][frame].onload = function() {
			resolve();
		}.bind(this);

		this.sprites[key][frame].onerror = function() {
			console.log("Loading of '" + source + "' failed")
			reject();
		}.bind(this);

		this.sprites[key][frame].src = source;
	}.bind(this));
}


SpriteManager.prototype.loadFromSpriteTable = function(spriteTable, update)
{
	return new Promise(function(resolve, reject) {
		var count = 0;

		// Determine number of images to load
		for(var i = 0; i < spriteTable.length; i++) {
			if('frames' in spriteTable[i])
				count += spriteTable[i]['frames'];
			else
				count += 1;
		}

		var images_left = count;

		/** Load sprites from sprite table **/
		for(var i = 0; i < spriteTable.length; i++) {
			var key = spriteTable[i]['key'];

			// For animated sprites, create array with one image per frame
			if('frames' in spriteTable[i]) {
				for(var j = 1; j <= spriteTable[i]['frames']; j++) {
					this.loadImage(key, j - 1, 'tiles/' + spriteTable[i]['src'] + "_" + j + '.png').then(
						function() {
							images_left--;
							if(images_left == 0)
								resolve();
							else
								update(images_left, count);
						}.bind(this));
				}

				continue;
			}

			// For other sprites, create a 1-frame animation
			this.loadImage(key, 0, 'tiles/' + spriteTable[i]['src'] + '.png').then(
				function() {
					images_left--;
					if(images_left == 0)
						resolve();
					else
						update(images_left, count);
				}.bind(this));
		}
	}.bind(this));
}

// Source: src/js/alien/level.js
/** @module Alien **/
var spriteSize = 32;

/**
 * Creates a new level object.
 *
 * @class
 * @classdesc Represents a level in the alien girl game.
 * @param {Object} levelMap - Two-dimensional array containing the level
 */
function Level(levelMap)
{
	this.levelMap = levelMap;
	this.collisionTypes = {};

	// Variable that contains canvas for drawing static level elements
	this.staticLevelCanvas = document.createElement("canvas");

	// Variable that contains coordinates and IDs for animated sprites
	this.dynamicLevelGeometry = [];

	// Contains debugging lines to draw
	this.lines = [];


	/**
	 * Reset level
	 */
	this.reset = function()
	{
		for(var i = 0; i < spriteTable.length; i++) {
			var key = spriteTable[i].key;
			this.collisionTypes[key] = spriteTable[i].collision;
		}

		this.cacheLevelGeometry();
	};


	this.fromArray = function(array)
	{
		this.levelMap = array;
	};


	this.toArray = function()
	{
		return this.levelMap;
	};


	this.update = function(input)
	{
	};


	/**
	 * Converts world coordinates to level (sprite) coordinates
	 */
	this.worldToLevelCoords = function(worldCoord)
	{
		return {
			x: Math.floor(worldCoord.x / spriteSize),
			y: Math.floor(worldCoord.y / spriteSize)
		};
	};


	/**
	* Pixel level sensor line for collision detection.
	*
	* Starts a sensor line at _origin_ in direction _dir_
	* and calls the function _func_ for all collisions until
	* the distance is greater than _length_ or the function
	* _func_ returns a value.
	 */
	this.sensor = function(origin, dir, length, func)
	{
		if(isNaN(origin.x) || isNaN(origin.y))
			throw new Error("Sensor: Origin is set to NaN (" + origin.x + ", " + origin.y + ")");

		if(isNaN(dir.x) || isNaN(dir.y))
			throw new Error("Sensor: Direction is set to NaN (" + dir.x + ", " + dir.y + ")");

		var o = this.worldToLevelCoords(origin);

		var result = this.spriteSensor(o, dir, length / spriteSize, function(hit)
		{
			if(dir.x == 0) hit.x = origin.x; else	hit.x = hit.sx * spriteSize;
			if(dir.y == 0) hit.y = origin.y; else	hit.y = hit.sy * spriteSize;

			// Collide with right most edge for leftward sensors
			if(dir.x < 0) hit.x += spriteSize;

			// Collide with bottom edge for upward sensors
			if(dir.y < 0)	hit.y += spriteSize;

			// Half blocks
			if(hit.type == 'topHalf') {
				if(dir.y < 0) hit.y -= 14;
				if(dir.x != 0 && origin.y - hit.sy * spriteSize > (18/32)*spriteSize) return false;
			}

			// Ramp down
			if(hit.type == 'hillDown') {
				if(dir.y == 0) hit.x += (hit.sy * spriteSize - origin.y) + spriteSize;
				if(dir.x == 0) hit.y += (hit.sx * spriteSize - origin.x) + spriteSize;
			}

			// Ramp up
			if(hit.type == 'hillUp') {
				if(dir.y == 0) hit.x -= (hit.sy * spriteSize - origin.y) + spriteSize;
				if(dir.x == 0) hit.y -= (hit.sx * spriteSize - origin.x);
			}

			// Compute difference
			hit.dx = hit.x - origin.x;
			hit.dy = hit.y - origin.y;

			// Do not report hits in opposite direction
			if(dir.x != 0 && dir.x * hit.dx <= 0)
				return false;

			// Invoke callback
			hit = func(hit);

			if(hit)
				return hit;
		});

		// Draw result
		if(this.getEngine().debugMode) {
			if(dir.x != 0)
				this.lines.push({ a: origin, b: result, color: 'blue' });
			else
				this.lines.push({ a: origin, b: result, color: 'red' });
		}

		return result;
	};


	/**
	 * Sprite level sensor line for collision detection.
	 *
	 * Starts a sensor line at _origin_ in direction _dir_
	 * and calls the function _func_ for all collisions until
	 * the distance is greater than _length_ or the function
	 * _func_ returns a value.
	 */
	this.spriteSensor = function(origin, dir, length, func)
	{
		if(isNaN(origin.x) || isNaN(origin.y))
			throw new Error("SpriteSensor: Origin is set to NaN (" + origin.x + ", " + origin.y + ")");

		if(isNaN(dir.x) || isNaN(dir.y))
			throw new Error("SpriteSensor: Direction is set to NaN (" + dir.x + ", " + dir.y + ")");

		for(var i = 0; i < Math.ceil(length); i++)
		{
			var l = {
				sx: origin.x + dir.x * i,
				sy: origin.y + dir.y * i
			};

			/**
			 * Out of bounds, return 'Bounds'
			 */
			if(l.sx < 0 || l.sx >= this.getWidth() ||
				 l.sy < 0 || l.sy >= this.getHeight())
			{
				return {
					type: 'Bounds',
					sx: clamp(l.sx, 0, this.getWidth()),
					sy: clamp(l.sy, 0, this.getHeight())
				};
			}

			// Get sprite number
			var sprite = this.levelMap[l.sy][l.sx];

			if(sprite in this.collisionTypes) {
				// Add type of collision to hit object
				l.sprite = sprite;
				l.type = this.collisionTypes[sprite];

				// Invoke callback, it will return the hit if it was accepted
				var hit = func(l);

				// If we hit something, return it, otherwise continue
				if(hit && hit.type !== false)
					return hit;
			}
		}

		// We did not hit anything, return false
		return { type: false };
	};


	/*********************
	 * Drawing functions *
	 *********************/


	/**
	 * Function to handle simple sprite animations
	 */
	this.animate = function(base, frames)
	{
		var deltaT = this.getEngine().timestamp / 140;
		return base + Math.floor(1 + deltaT % frames);
	};


	/**
	 * Draws a single sprite in the grid
	 */
	this.drawSprite = function(context, x, y, sprite, frameCount)
	{
		if(sprite == 1 && !this.parent.editMode)
			return;

		var box = {x: x * spriteSize, y: y * spriteSize, width: spriteSize, height: spriteSize};
		var frame = (this.getEngine().timestamp >> 7) % frameCount;

		return this.parent.spriteManager.drawSprite(context, box, sprite, frame);
	};


	/**
	 * Creates a cache of the level geometry. This cache consists of two parts:
	 *   - An image containing all the static geometry
	 *   - An array containing coordinates and IDs for all animated sprites
	 */
	this.cacheLevelGeometry = function()
	{
		this.staticLevelCanvas.width = this.getWidth() * spriteSize;
		this.staticLevelCanvas.height = this.getHeight() * spriteSize;

		this.dynamicLevelGeometry = new Array();
		var context = this.staticLevelCanvas.getContext("2d");

		for(var i = 0; i < this.levelMap.length; i++) {
			for(var j = 0; j < this.levelMap[0].length; j++) {
				var sprite = this.levelMap[i][j];
				var frameCount =  this.parent.spriteManager.getFrameCount(sprite);

				// Ignore invalid sprites (that the sprite manager doesn't know about)
				if(!this.parent.spriteManager.isSpriteValid(sprite))
					continue;

				// Sprites with 1 frame are static, more than one dynamic
				if(frameCount == 1)
					this.drawSprite(context, j, i, sprite, 1);
				else
					this.dynamicLevelGeometry.push({
						x: j, y: i, frameCount: frameCount, sprite: sprite
					});
			}
		}
	};


	/**
	 * Draw debug lines (from this.lines).
	 *
	 * @param {Context} context - Context to draw to.
	 */
	this.drawDebugLines = function(context)
	{
		for(var i = 0; i < this.lines.length; i++)
			this.drawLine(context, this.lines[i].a, this.lines[i].b, this.lines[i].color);
		this.lines = [];
	};


	/**
	 * Draw a line to the context.
	 *
	 * @param {Context} context - Context to draw to.
	 * @param {Object} a - Starting coordinate of the line.
	 * @param {Object} b - Final coordinate of the line.
	 * @param {Object} color - Color of the line.
	 */
	this.drawLine = function(context, a, b, color)
	{
		context.beginPath();
		context.moveTo(a.x, a.y);
		context.lineTo(b.x, b.y);
		context.closePath();
		context.strokeStyle = color;
		context.stroke();
	};


	/**
	 * Draw entire level.
	 *
	 * @param {Context} context - Context to draw to.
	 */
	this.draw = function(context)
	{
		context.drawImage(this.staticLevelCanvas, 0, 0);

		for(var i = 0; i < this.dynamicLevelGeometry.length; i++) {
			var item = this.dynamicLevelGeometry[i];
			this.drawSprite(context, item.x, item.y, item.sprite, item.frameCount);
		}

		this.drawDebugLines(context);
	};
}


Level.prototype = new BaseObject();


/**
 * Returns the height of the level in sprites.
 *
 * @return {Number} Height of the level.
 */
Level.prototype.getHeight = function()
{
	return this.levelMap.length;
};


/**
 * Returns the width of the level in sprites.
 *
 * @return {Number} Width of the level.
 */
Level.prototype.getWidth = function()
{
	return this.levelMap[0].length;
};


/**
 * Sets the sprite at a specific block.
 *
 * @param {Object} coords - Coordinates.
 * @param {Number} sprite - Number of the sprite to set.
 */
Level.prototype.setSprite = function(coords, sprite)
{
	// Check invalid coordinates
	if(coords.x < 0 || coords.y < 0)
		return false;

	// Expand level if not big enough
	if(this.levelMap.length < ( 1 + coords.y) ||
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

	this.cacheLevelGeometry();
};

// Source: src/js/alien/level_loader.js
/** @module Alien **/
/**
 * Constructs a level loading class
 *
 * @class
 * @classdesc Level loading class
 */
function LevelLoader(game)
{
  this.game = game;

  this.Sprite_Player = 0x0002;
  this.Sprite_Enemy_Fly = 0x0A00;
  this.Sprite_Enemy_Bee = 0x0A03;
  this.Sprite_Enemy_Bat = 0x0A06;

  /**
   * Loads the level from the list and sets up the game
   * state (players / enemies) accordingly.
   *
   * @param {String} name - Name of the level to load
   */
  this.loadLevel = function(name)
  {
    return new Promise(function(resolve, reject) {
      this.game.deleteAllObjects();
      this.getLevelFromServer(name).then(
        function(data) {
          var level = new Level(data.level);

          this.setLevelBounds(level);
          this.game.addObject('level', level);

          for(var i = 0; i < data.objects.length; i++) {
            var object = data.objects[i];

            if(!(object.type in constructors))
              throw new Error("Invalid type: " + object.type);

            var constructor = constructors[object.type];

            if(!constructor) {
              console.log("Skipping object: ", object);
              continue;
            }

            this.game.addObject(object.name, constructor(object));
          }

          resolve();
        }.bind(this),
        function(error) {
          console.log("LevelLoader.loadLevel failed: " + error);
          reject(error);
        });
      }.bind(this));
  };


  this.saveLevel = function(name)
  {
    var data = {
        'version': 2,
        'level': null,
        'objects': []
      };

    var names = this.game.getObjectNames();

    for(var i = 0; i < names.length; i++) {
      var object = this.game.getObject(names[i]);
      var array = object.toArray();

      if(names[i] == 'level') {
        data.level = array;
        continue;
      }

      array.name = names[i];
      data.objects.push( array );
    }

    return this.saveLevelToServer(name, data);
  };


  /**
   * Retrieves the level from the server
   *
   * @param {String} name - Name of the level to load
   */
  this.getLevelFromServer = function(name)
  {
  	return new Promise(function(resolve, reject) {
  		if(typeof(server) == 'undefined' || !server)
  			reject();

  		jQuery.ajax({
  			url: server + "ldb/get_level.php?name=" + name,
  			dataType: 'json'
  		}).done(function(data) {

        if($.isArray(data))
          data = upgradeLevelVersion1(data);

  			resolve(data);
  		}).fail(function(response) {
        console.log("LevelLoader.getLevelFromServer() failed " + response);
  			reject(response.responseText);
  		});
  	});
  };


  /**
  * Save the level to the server
  *
  * @param {String} name - Name of the level to save
  */
  this.saveLevelToServer = function(name, level)
  {
  	return new Promise(function(resolve, reject) {
  		if(typeof(server) == 'undefined' || !server)
  			reject();

  		jQuery.ajax({
  			url: server + "ldb/set_level.php?name=" + name,
  			data: JSON.stringify(level),
  			contentType: 'text/plain',
  			method: 'POST'
  		}).done(function(data) {
  			resolve();
  		}.bind(level)).fail(function(response) {
  			reject(response.responseText);
  		});
  	});
  };


  /**
   * Set level bounds on game object
   */
  this.setLevelBounds = function(level)
  {
    this.game.setLevelBounds({
      x: spriteSize,
      y: spriteSize,
      width: (level.getWidth() - 2) * spriteSize,
      height: (level.getHeight() - 2) * spriteSize
    });
  };
}


/**
 * Upgrade level from version 1 to version 2.
 *
 * @param {Array} data - Version 1 level returned from server
 * @returns {Array} Version 2 level
 */
function upgradeLevelVersion1(data)
{
  // Convert format
  data = {
    'version': 2,
    'level': data,
    'objects': [],
  };

  /**
   * Scans the level for special items, such as the player and enemies,
   * adds them to a list and removes them from the level.
   */
  var i_player = 1;
  var i_enemy = 1;

  for(var x = 0; x < data.level[0].length; x++) {
    for(var y = 0; y < data.level.length; y++) {

      // Extract location of player objects
      if(data.level[y][x] == 2) {
        data.objects.push({
          name: 'player_' + (i_player++),
          type: 'player',
          x: x * spriteSize,
          y: y * spriteSize - 12
        });

        data.level[y][x] = 0;
      }

      // Extract location of enemy objects
      if(isEnemy(data.level[y][x])) {
        data.objects.push({
          name: 'enemy_' + (i_enemy++),
          sprite: data.level[y][x],
          type: 'enemy',
          x: x * spriteSize, y: y * spriteSize,
          aggressionLevel: (data.level[y][x] == 0x0A03)?0:1
        });

        data.level[y][x] = 0;
      }
    }
  }

  // Add default player if none are found
  if(i_player == 1) {
    data.objects.push({
      name: 'player_1',
      type: 'player',
      x: spriteSize, y: 4 * spriteSize
    });
  }

  return data;
}

// Source: src/js/alien/math.js
/** @module Alien **/
/**
 * Returns the distance to and type of the ground object
 * directly underneath the player
 */
function findGround(player, level)
{
	var x_left = Math.floor(player.x / 32);
	var x_right = Math.floor((player.x + player.width) / 32);

	var y = Math.floor(player.y / 32);

	var height = level.getHeight();

	for(var i = y; i < height; i++) {
		var code_left = level.levelMap[i][x_left];
		var code_right = level.levelMap[i][x_right];

		if(code_left >= 288 && code_left <= 303 || code_right >= 288 && code_right <= 303) {
			return {x: x_left, y: i, dist: (i * 32 - player.y), type: 'Snow'};
		}
	}

	return null;
}


/**
 * Checks whether the X coordaintes of two objects collide
 *
 * @param {Object} objectA - First object
 * @param {Object} objectB - Second object
 * @return {false|Object} False if they do not collide
 */
function collisionCheckX(objectA, objectB)
{
	var gapXA = objectA.x - (objectB.x + objectB.width);
	var gapXB = objectB.x - (objectA.x + objectA.width);

	if(gapXA >= 0 || gapXB >= 0)
		return false;

	return {
		type: objectB.type,
		normal: (gapXA < gapXB)?gapXB:-gapXA
	};
}


/**
 * Checks whether the Y coordaintes of two objects collide
 *
 * @param {Object} objectA - First object
 * @param {Object} objectB - Second object
 * @return {false|Object} False if they do not collide
 */
function collisionCheckY(objectA, objectB)
{
	var gapYA = objectA.y - (objectB.y + objectB.height);
	var gapYB = objectB.y - (objectA.y + objectA.height);

	if(gapYA >= 0 || gapYB >= 0)
		return false;

	return {
		type: objectB.type,
		normal: (gapYA < gapYB)?gapYB:-gapYA
	};
}


/**
 * Checks whether two objects are colliding and returns
 * a possible resolution strategy.
 *
 * @param {Object} objectA - First object
 * @param {Object} objectB - Second object
 * @return {false|Object} False if they do not collide
 */
function collisionCheck(objectA, objectB)
{
	var collideX = collisionCheckX(objectA, objectB);
	var collideY = collisionCheckY(objectA, objectB);

	if(collideX === false || collideY === false)
		return false;

	var ci = {
		type: objectB.type,
		normal: {
			x: collideX.normal,
			y: collideY.normal
		},
		axis: (Math.abs(collideX.normal) < Math.abs(collideY.normal))?'x':'y'
	};

	return ci;
}


function detectCollisionArray(objectA, objectsB, callback, offset)
{
	var box;

	for(var key in objectsB) {
		if(offset) {
			// Copy box for collision detection
			box = {x: objectsB[key].x + offset.x,
					   y: objectsB[key].y + offset.y,
					   width: objectsB[key].width,
					   height: objectsB[key].height,
					   type: objectsB[key].type};
		} else {
			box = objectsB[key];
		}

		var ci = collisionCheck(objectA, box);

		if(!ci)
			continue;

		if(typeof ci.type == "object") {
			detectCollisionArray(objectA, ci.type, callback, box);
		} else {
			callback(ci);
		}
	}
}


/**
 * Checks whether a given position is within a box
 */
function inBox(x, y, box)
{
	if(x >= box.x && x <= box.x + box.width &
		 y >= box.y && y <= box.y + box.height)
			return true;
	return false;
}


/**
 * Clamps the value between two extremes.
 *
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max)
{
	return Math.min(max, Math.max(min, value));
}


/**
 * Returns the sign of the number, 1 for positive, -1 for negative.
 */
function sign(number)
{
	return (number >= 0)?1:-1;
}


/**
 * Linear interpolation
 */
function lerp(from, to, t)
{
	return from + (to - from) * t;
}

// Source: src/js/alien/sprites.js
/** @module Alien **/
/**
 * Returns whether a given sprite should be slippery
 *
 * @param {number} sprite - ID of sprite
 * @returns {boolean} True if slippery, false if not
 */
function isSlippery(sprite)
{
	return (sprite >= 0x0120 && sprite <= 0x012F) ||	// Snow
			   (sprite >= 0x0130 && sprite <= 0x013F);		// Planet
}


/**
 * Returns whether a sprite is an enemy
 *
 * @param {number} sprite - ID of sprite
 * @returns {boolean} True if enemy, false if not
 */
function isEnemy(sprite)
{
	return sprite >= 0x0A00 && sprite <= 0x0B00;
}


var constructors = {
	'enemy': function(array) {
		var enemy = new Enemy();
		enemy.fromArray(array);
		return enemy;
	},

	'player': function(array) {
		var player = new Player();
		player.fromArray(array);
		return player;
	},

	'bomb': function(array) {
		var bomb = new Bomb();
		bomb.fromArray(array);
		return bomb;
	},

	'rock': function(array) {
		var rock = new Rock();
		rock.fromArray(array);
		return rock;
	},

	'worm': function(array) {
		var worm = new Worm();
		worm.fromArray(array);
		return worm;
	},

	'frog': function(array) {
		var frog = new Frog();
		frog.fromArray(array);
		return frog;
	},

	'snail': function(array) {
		var snail = new Snail();
		snail.fromArray(array);
		return snail;
	}
};


var spriteTable = [
	{key: 0x0001, src: 'clipping', collision: true},
	{key: 0x0002, src: 'sara/idle/r/1', collision: false, type: 'player'},

	{key: 0x0010, src: 'sara/idle_left',  frames: 3, toolbox: false},
	{key: 0x0011, src: 'sara/idle_right', frames: 3, toolbox: false},
	{key: 0x0012, src: 'sara/walk_left',  frames: 3, toolbox: false},
	{key: 0x0013, src: 'sara/walk_right', frames: 3, toolbox: false},
	{key: 0x0014, src: 'sara/jump_left',  frames: 3, toolbox: false},
	{key: 0x0015, src: 'sara/jump_right', frames: 3, toolbox: false},

	/* Grass */
	{key: 0x0101, src: 'grass/grassLeft', collision: true},
	{key: 0x0102, src: 'grass/grassMid', collision: true},
	{key: 0x0103, src: 'grass/grassRight', collision: true},
	{key: 0x0104, src: 'grass/grassCenter', collision: true},
	{key: 0x0105, src: 'grass/grassCliff_left', collision: true},
	{key: 0x0106, src: 'grass/grassCliff_right', collision: true},
	{key: 0x0107, src: 'grass/grassCliffAlt_left', collision: true},
	{key: 0x0108, src: 'grass/grassCliffAlt_right', collision: true},
	{key: 0x0109, src: 'grass/grassCorner_left', collision: true},
	{key: 0x010A, src: 'grass/grassCorner_right', collision: true},
	{key: 0x010B, src: 'grass/grassHill_left', collision: 'hillUp'},
	{key: 0x010C, src: 'grass/grassHill_right', collision: 'hillDown'},
	{key: 0x010D, src: 'grass/grassHalf', collision: 'topHalf'},
	{key: 0x010E, src: 'grass/grassHalf_left', collision: 'topHalf'},
	{key: 0x010F, src: 'grass/grassHalf_mid', collision: 'topHalf'},
	{key: 0x0110, src: 'grass/grassHalf_right', collision: 'topHalf'},


	/* Snow */
	{key: 0x0120, src: 'snow/snowLeft', collision: true},
	{key: 0x0121, src: 'snow/snowMid', collision: true},
	{key: 0x0122, src: 'snow/snowRight', collision: true},
	{key: 0x0123, src: 'snow/snowCenter', collision: true},
	{key: 0x0124, src: 'snow/snowCliff_left', collision: true},
	{key: 0x0125, src: 'snow/snowCliff_right', collision: true},
	{key: 0x0126, src: 'snow/snowCliffAlt_left', collision: true},
	{key: 0x0127, src: 'snow/snowCliffAlt_right', collision: true},
	{key: 0x0128, src: 'snow/snowCorner_left', collision: true},
	{key: 0x0129, src: 'snow/snowCorner_right', collision: true},
	{key: 0x012A, src: 'snow/snowHill_left', collision: 'hillUp'},
	{key: 0x012B, src: 'snow/snowHill_right', collision: 'hillDown'},
	{key: 0x012C, src: 'snow/snowHalf', collision: 'topHalf'},
	{key: 0x012D, src: 'snow/snowHalf_left', collision: 'topHalf'},
	{key: 0x012E, src: 'snow/snowHalf_mid', collision: 'topHalf'},
	{key: 0x012F, src: 'snow/snowHalf_right', collision: 'topHalf'},

	/* Planet */
	{key: 0x0130, src: 'planet/planetLeft', collision: true},
	{key: 0x0131, src: 'planet/planetMid', collision: true},
	{key: 0x0132, src: 'planet/planetRight', collision: true},
	{key: 0x0133, src: 'planet/planetCenter', collision: true},
	{key: 0x0134, src: 'planet/planetCliff_left', collision: true},
	{key: 0x0135, src: 'planet/planetCliff_right', collision: true},
	{key: 0x0136, src: 'planet/planetCliffAlt_left', collision: true},
	{key: 0x0137, src: 'planet/planetCliffAlt_right', collision: true},
	{key: 0x0138, src: 'planet/planetCorner_left', collision: true},
	{key: 0x0139, src: 'planet/planetCorner_right', collision: true},
	{key: 0x013A, src: 'planet/planetHill_left', collision: 'hillUp'},
	{key: 0x013B, src: 'planet/planetHill_right', collision: 'hillDown'},
	{key: 0x013C, src: 'planet/planetHalf', collision: 'topHalf'},
	{key: 0x013D, src: 'planet/planetHalf_left', collision: 'topHalf'},
	{key: 0x013E, src: 'planet/planetHalf_mid', collision: 'topHalf'},
	{key: 0x013F, src: 'planet/planetHalf_right', collision: 'topHalf'},


	/* Sand */
	{key: 0x0140, src: 'sand/sandLeft', collision: true},
	{key: 0x0141, src: 'sand/sandMid', collision: true},
	{key: 0x0142, src: 'sand/sandRight', collision: true},
	{key: 0x0143, src: 'sand/sandCenter', collision: true},
	{key: 0x0144, src: 'sand/sandCliffLeft', collision: true},
	{key: 0x0145, src: 'sand/sandCliffRight', collision: true},
	{key: 0x0146, src: 'sand/sandCliffLeftAlt', collision: true},
	{key: 0x0147, src: 'sand/sandCliffRightAlt', collision: true},
	{key: 0x0148, src: 'sand/sandHillLeft2', collision: true},
	{key: 0x0149, src: 'sand/sandHillRight2', collision: true},
	{key: 0x014A, src: 'sand/sandHillLeft', collision: 'hillUp'},
	{key: 0x014B, src: 'sand/sandHillRight', collision: 'hillDown'},
	{key: 0x014C, src: 'sand/sandHalf', collision: 'topHalf'},
	{key: 0x014D, src: 'sand/sandHalfLeft', collision: 'topHalf'},
	{key: 0x014E, src: 'sand/sandHalfMid', collision: 'topHalf'},
	{key: 0x014F, src: 'sand/sandHalfRight', collision: 'topHalf'},

	{key: 0x0115, src: 'sand/sand_liquid', collision: 'water'},
	{key: 0x0114, src: 'metalCenter', collision: true},

	{key: 0x0204, src: 'water/no_waves2_top', frames: 7, collision: 'water'},
	{key: 0x0206, src: 'water/no_waves2_body', frames: 7, collision: 'waterBody'},

	{key: 0x0201, src: 'water/normal_waves2_top', frames: 6, collision: 'water'},
	{key: 0x0202, src: 'water/normal_waves2_body', frames: 6, collision: 'waterBody'},

	{key: 0x0203, src: 'water/big_waves2_top', frames: 3, collision: 'water'},
	{key: 0x0205, src: 'water/big_waves2_body', frames: 3, collision: 'waterBody'},

	{key: 0x0301, src: 'plant', collision: false},
	{key: 0x0302, src: 'pineSapling', collision: false},
	{key: 0x0303, src: 'pineSaplingAlt', collision: false},
	{key: 0x0304, src: 'cactus', collision: false},

	{key: 0x0401, src: 'spikes', collision: 'water'},
	{key: 0x0402, src: 'doorOpen', collision: 'Door'},
	{key: 0x0403, src: 'doorOpenTop', collision: false},

	{key: 0x0404, src: 'springboardDown', collision: 'boardDown'},
	{key: 0x0405, src: 'springboardUp', collision: 'boardUp'},


	{key: 0x0504, src: 'signRight', collision: false},
	{key: 0x0505, src: 'signExit', collision: 'exit'},

	{key: 0x0601, src: 'cloud1-left', collision: true},
	{key: 0x0602, src: 'cloud1-right', collision: true},

	{key: 0x0701, src: 'bomb', collision: true, type: 'bomb'},
	{key: 0x0702, src: 'rock', collision: true, type: 'rock'},
	{key: 0x0703, src: 'weight', collision: true},
	{key: 0x0704, src: 'switchRight', collision: false},
	{key: 0x0705, src: 'switchMid', collision: false},
	{key: 0x0706, src: 'switchLeft', collision: false},

	{key: 0x0901, src: 'numbers/1', collision: true},
	{key: 0x0902, src: 'numbers/2', collision: true},
	{key: 0x0903, src: 'numbers/3', collision: true},
	{key: 0x0904, src: 'numbers/4', collision: true},
	{key: 0x0905, src: 'numbers/5', collision: true},

	{key: 0x0A00, src: 'fly/fly', frames: 2, collision: 'Fly', type: 'enemy'},

	{key: 0x0A01, src: 'fly/fly_dead', collision: true, toolbox: false},

	{key: 0x0A03, src: 'bee/bee', frames: 2, collision: 'Bee', type: 'enemy'},
	{key: 0x0A04, src: 'bee/bee_dead', collision: true, toolbox: false},

	{key: 0x0A06, src: 'bat/bat', frames: 2, collision: 'Bat', type: 'enemy'},
	{key: 0x0A07, src: 'bat/bat_dead', collision: true, toolbox: false},
	{key: 0x0A08, src: 'bat/bat_hang', collision: true, toolbox: false},

	{key: 0x0A0A, src: 'bug/ladybug', collision: true, type: 'enemy'},
	{key: 0x0A0B, src: 'bug/ladybug_move', collision: true, toolbox: false},
	{key: 0x0A0C, src: 'bug/ladybug_fly', collision: true, toolbox: false},

	{key: 0x0A0E, src: 'worm/wormGreen', frames: 2, collision: true, type: 'worm'},
	{key: 0x0A0F, src: 'worm/wormGreen_dead', collision: true, toolbox: false},

	{key: 0x0A10, src: 'slime/snakeSlime', collision: true, toolbox: false},
	{key: 0x0A11, src: 'slime/snakeSlime_ani', collision: true, toolbox: false},
	{key: 0x0A12, src: 'slime/snakeSlime_dead', collision: true, toolbox: false},

	{key: 0x0A1A, src: 'frog/frog', collision: true, type: 'frog'},
	{key: 0x0A1B, src: 'frog/frog_move', collision: true, toolbox: false},
	{key: 0x0A1C, src: 'frog/frog_dead', collision: true, toolbox: false},

	{key: 0x0A20, src: 'snail/snail', frames: 2, collision: true, type: 'snail'},
	//{key: 0x0A21, src: 'snail/snail', frames: 2, collision: true, type: 'snail'},
];

// Source: src/js/alien/toolbox.js
/** @module Alien **/
/**
 * @class
 * @classdesc Represents box of available sprites for use in Editor
 */
function SpriteBox(element, editor, spriteTable)
{
	this.element = document.getElementById(element);
	this.images = [];


	/**
	 * Mark the specified image as selected
	 *
	 * @param {Image} target - Target <img> element
	 */
	this.select = function(target)
	{
		for(var i = 0; i < spriteTable.length; i++) {
			if(this.images[i] == target) {
				var key = spriteTable[i].key;
				this.images[i].setAttribute("class", "selected");
				editor.setSprite(key);
			} else {
				this.images[i].setAttribute("class", "sprite");
			}
		}
	};


	var currentKey = spriteTable[0].key & 0xFF00;
	var insertBreaks = false;
	for(var i = 0; i < spriteTable.length; i++) {

		// Insert breaks when the first element of key changes.
		if(insertBreaks && currentKey != spriteTable[i].key & 0xFF00) {
			var br = document.createElement("br");
			this.element.appendChild(br);
			currentKey = spriteTable[i].key[0];
		}

		this.images[i] = document.createElement("img");
		var src = spriteTable[i].src;

		if ('frames' in spriteTable[i])
			src += '_1';

		this.images[i].src = 'tiles/' + src + '.png';
		this.images[i].setAttribute("class", "sprite");

		this.images[i].onclick = function(e) {
			this.select(e.target);
		}.bind(this);

		// Do not show if toolbox is set to false
		if('toolbox' in spriteTable[i] && spriteTable[i].toolbox === false)
			continue;

		this.element.appendChild(this.images[i]);
	}
}

// Source: src/js/alien/objects/bomb.js
/** @module Alien **/
/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
function Bomb()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;
  this.alive = true;
  this.aggressionLevel = 0;

  this.sprite = 0;


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'bomb',
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
  }


  /**
   * Setups the enemy at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
  }


  /**
	 * Update stating position of the bomb
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
   * Set base sprite for bomb
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the bomb
   */
  this.update = function()
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the enemy to touch the surface
     */
    var callback = function(hit) {
      if(hit.type == 'water') {
        hit.y += 24;
        hit.dy += 24;
      }
      return hit;
    }

    var hit = level.sensor(
      { x: this.x + this.width / 2, y: oriY },
      { x: 0, y: dirY }, 256, callback);

    if(dirY > 0 && hit && hit.dy < 10) {
      this.y = hit.y - this.height;
      this.velY = 0;
    }

    this.velY += this.gravity;
    this.y += this.velY;
  }


  /**
   * Draws the bomb to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
  }
}

Bomb.prototype = new BaseObject();

// Source: src/js/alien/objects/enemy.js
/** @module Alien **/
/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
function Enemy()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;
  this.alive = true;
  this.aggressionLevel = 0;

  this.sprite = 0;
  this.frameCount = 1;

  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'enemy',
      'sprite': this.sprite,
      'aggressionLevel': this.aggressionLevel
    };
  }


  /**
   * Unserialize state from array
   */
  this.fromArray = function(array)
  {
    if('aggressionLevel' in array)
      this.setAggressionLevel(array.aggressionLevel);

    this.setStartingPosition(array.x, array.y);
    this.setBaseSprite(array.sprite);
  }


  /**
   * Setups the enemy at the start of the game
   */
  this.reset = function()
  {
    this.targetX = this.baseX;
    this.targetY = this.baseY;

    this.x = this.baseX;
    this.y = this.baseY;

    this.alive = true;

    this.frameCount = this.parent.spriteManager.getFrameCount(this.sprite);
  }


  /**
   * Set the aggression level of the enemy
   *
   * @param {number} aggressionLevel - Aggressiveness of animal
   */
  this.setAggressionLevel = function(aggressionLevel)
  {
    this.aggressionLevel = aggressionLevel;
  }


  /**
	 * Update stating position of the enemy
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
   * Set base sprite for enemy
   * @param {number} sprite - ID of base sprite (dead sprite is +1)
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }

  /**
   * Updates the enemy; it is hunting the player
   */
  this.updateHunting = function()
  {
    var player = this.parent.getObject("player_1");

    if(!player)
      throw new Error("Could not find object player_1");

    var player_underneath =
      player.x + player.width / 2 >= this.x &&
      player.x + player.width / 2 <= this.x + this.width &&
      player.y > this.y;

    var player_went_past = (player.x - 2 * player.width) > this.baseX;


    if(this.aggressionLevel != 0)
    {
      /** Move towards player when player is underneath **/
      if(player_underneath || player_went_past) {
        this.targetX = player.x;
        this.targetY = player.y;
      } else {
        this.targetX = this.baseX;
        this.targetY = this.baseY;
      }

      this.x = lerp(this.x, this.targetX, 0.2);
      this.y = lerp(this.y, this.targetY, 0.3);
    }

    /** Check collision with player **/
    var collision = collisionCheck(this, player);
    if(this.alive && collision) {
      if(collision.normal.y < 0 || player_went_past) {
        if(this.aggressionLevel != 0)
          player.kill("enemy");
      } else {
        this.alive = false;
        player.events.push("KILLED_ENEMY");

        // Reset rotation
        this.rotation = 0;

        // Player kills the bee, make sure it falls with the same speed
        // as the player, otherwise the player will pass it.
        this.velY = player.velY;
      }
    }
  }


  /**
   * Updates the enemy; it is dying
   */
  this.updateDying = function()
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the enemy to touch the surface
     */
    var callback = function(hit) {
      if(hit.type == 'water') {
        hit.y += 24;
        hit.dy += 24;
      }
      return hit;
    }

    var hit = level.sensor(
      { x: this.x + this.width / 2, y: oriY },
      { x: 0, y: dirY }, 256, callback);

    if(dirY > 0 && hit && hit.dy < 10) {
      this.y = hit.y - this.height;
      this.velY = 0;
    }

    this.velY += this.gravity;
    this.y += this.velY;

    this.rotation = lerp(this.rotation, Math.PI, 0.025);
  }


  /**
   * Updates the enemy
   */
  this.update = function()
  {
    if(this.alive) {
      this.updateHunting();
    } else {
      this.updateDying();
    }
  }


  /**
   * Draws the enemy to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    var frame = Math.floor((this.getEngine().timestamp / 120) % this.frameCount);

    if(this.alive) {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, frame);
    } else {
      this.parent.spriteManager.drawSprite(context, this, this.sprite + 1, 0, function(context) {
        context.rotate(this.rotation);
      }.bind(this));
    }
  }
}

Enemy.prototype = new BaseObject();

// Source: src/js/alien/objects/frog.js
/** @module Alien **/
/**
 * Creates new frog object.
 *
 * @class
 * @classdesc Object representing an frog in the alien girl game.
 */
function Frog()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;

  // Worm and player objects to check collisions against
  this.player = false;
  this.worms = [];


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'frog',
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
  }


  /**
   * Setups the frog at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
    this.alive = true;

    // Find worms
    var names = this.parent.getObjectNames();

    for(var i = 0; i < names.length; i++) {
      var object = this.parent.getObject(names[i]);
      if(object.type == 'worm')
        this.worms.push(object);
    }

    // Find player
    this.player = this.parent.getObject("player_1");
  }


  /**
	 * Update stating position of the frog
	 *
	 * @param {number} x - X coordinate of frog starting location
   * @param {number} y - Y coordinate of frog starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for frog
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the frog
   */
  this.update = function(keyboard)
  {
    var push_key = keyboard.keys[keyboard.KEY_P];
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the frog to touch the surface
     */
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

    // Kill any worms that we encounter
    for(var i = 0; i < this.worms.length; i++) {
      var collision = collisionCheck(this, this.worms[i]);

      if(collision)
        this.worms[i].kill();
    }


    var collision = collisionCheck(this, this.player);

    if(!collision)
      return;

    // Move when being pushed by the player
    if(push_key && this.alive) {
      if(collision.axis == 'x' && Math.abs(collision.normal.x) < 5)
        this.x += collision.normal.x;
    }

    // Kill frog when jumped on it from the top
    if(collision.axis == 'y' && this.player.velY > 4)
      this.alive = false;
  }


  /**
   * Draws the frog to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    if(this.alive) {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      this.parent.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
    }
  }
}

Frog.prototype = new BaseObject();

// Source: src/js/alien/objects/player.js
/** @module Alien **/
/**
 * Implements player in alien girl game, it is reponsible for input/movement,
 * kinematics, visual representation, collision handling.
 *
 * @class
 * @classdesc Represents the player in the alien girl game.
 */
function Player()
{
	// Depends on sprite
	this.width = 32;
	this.height = 46;
	this.type = 'player';

	this.baseX = 0;
	this.baseY = 0;

	this.sensor_left = 6;
	this.sensor_right = 23;

	this.sink = new Sink(server + "/sink.php?game=AG" +
			"&session=" + options.gameId +
			"&user=" + options.userId +
			"&level=" + options.levelName +
			"&debug=" + (options.debugMode?"true":"false"));

	this.sink.transmitEvery = 20;

	this.events = [];


	this.reset = function()
	{
		this.engine = this.getEngine();

		// Position
		this.x = this.baseX;
		this.y = this.baseY;
		this.faceRight = true;

		// Velocities
		this.velX = 0;
		this.velY = 0;

		this.speed = 3.5;
		this.speedDefault = 3.5;
		this.speedSnow = 7.0;

		this.jumping = false;
		this.grounded = false;

		this.ground = { slippery: false, type: true }

		// Physics parameters
		this.gravity = 0.3;
		this.friction = this.frictionDefault;

		this.slideAccelerationSnow = 0.5;

		// Friction values for
		this.frictionDefault = 0.8;		// normal ground
		this.frictionDown = 0.7;			// when down is pressed
		this.frictionSnow = 0.999;			// when on snow

		this.scale = 1;
		this.alive = true;
		this.finished = false;

		this.events.push("RESTART");
	}


	/**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
			'type': 'player'
    };
  }


  /**
   * Unserialize state from array
   */
  this.fromArray = function(array)
  {
    this.setStartingPosition(array.x, array.y);
  }


	/**
	 * Terminates the player
	 *
	 * @param {String} Reason the player was killed
	 */
	this.kill = function(reason)
	{
		if(this.alive) {
			this.events.push("DIED_" + reason.toUpperCase());
			this.sendPosition();
		}

		this.alive = false;
	}


	/**
	 * Update stating position of the player
	 *
	 * @param {number} x - X coordinate of player starting location
   * @param {number} y - Y coordinate of player starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


	/**
	 * Send position to server
	 */
	this.sendPosition = function()
	{
		this.sink.appendData({
			timestamp: Date.now() / 1000,
			x: this.x / 32,
			y: this.y / 32,
			event: JSON.stringify(this.events)
		});

		this.events = [];
	}


	this.getPermittedActions = function()
	{
		var x = Math.floor(this.x / 32);
		var y = Math.floor(this.y / 32);

		var level = this.parent.getObject("level");
		var code = level.levelMap[0][x] - 2304;

		return {
			walk_on_water: code == 1,
			walk_upside_down: code == 3 || code == 1,
			fly: code == 2,
		};
	}


	this.handleInput = function(input)
	{
		var permitted = this.getPermittedActions();

		if(!permitted.walk_upside_down && this.gravity < 0) {
			this.events.push("GRAVITY_NORMAL");
			this.gravity *= -1;
		}

		// Jump away from gravity
		if(input.keys[input.KEY_SPACE]) {
			if(!this.jumping && this.grounded) {
				this.jumping = true;
				this.grounded = false;
				this.velY = -sign(this.gravity) * this.speedDefault * 2;
			}
		}

		// Flip gravity if up and down are pressed at the same time
		if(input.keys[input.KEY_UP] && input.keys[input.KEY_DOWN])
		{
			// Allow wait at least 200ms before next flip
			if(permitted.walk_upside_down && (!this.lastFlip || this.engine.timestamp - this.lastFlip > 200))
			{
				this.lastFlip = this.engine.timestamp
				this.gravity *= -1;

				if(this.gravity < 0)
					this.events.push("GRAVITY_INVERTED")
				else
					this.events.push("GRAVITY_NORMAL");
			}
		} else {
			// Flying (under normal gravity)
			if(permitted.fly && input.keys[input.KEY_UP])
			{
				this.velY = -this.speedDefault * 0.5;
			}

			// Flying (when gravity is inverted)
			if(permitted.fly && input.keys[input.KEY_DOWN])
			{
				this.velY = this.speedDefault * 0.5;
			}
		}

		// Move to the left
		if(input.keys[input.KEY_LEFT] && this.velX > -this.speed)
			this.velX--;

		// Move to the right
		if(input.keys[input.KEY_RIGHT] && this.velX < this.speed)
			this.velX++;

		if(this.ground.slippery && !input.keys[input.KEY_DOWN]) {
			if(this.ground.type == 'hillDown')
				if(this.velX > 0.5 * -this.speed)
					this.velX -= 0.25;
			if(this.ground.type == 'hillUp')
				if(this.velX < 0.5 * this.speed)
					this.velX += 0.25;
		}

		// Change friction when pressing down / ground is slippery
		if(input.keys[input.KEY_DOWN]) {
			this.friction = this.frictionDown;
			this.speed = this.speedDefault;
		} else if(this.ground.slippery) {
			this.friction = this.frictionSnow;
			this.speed = this.speedSnow;
		} else {
			this.friction = this.frictionDefault;
			this.speed = this.speedDefault;
		}
	}


	/**
	 * Takes a list of sensors and returns the closest and furthest sensors
	 */
	this.combineSensors = function(sensors)
	{
		var minSensor = false;
		var maxSensor = false;

		for(var i = 0; i < sensors.length; i++) {
			if(!sensors[i] || !sensors[i].type)
				continue;

			if(!minSensor || sensors[i].y < minSensor.y)
				minSensor = sensors[i];

			if(!maxSensor || sensors[i].y > maxSensor.y)
				maxSensor = sensors[i];
		}

		return { min: minSensor, max: maxSensor };
	}


	this.sensorCallback = function(hit)
	{
		if(hit.type == "exit") {
			if(hit.dx == 0 && !this.finished) {
				this.events.push("EXIT");
				this.finished = true;
			}

			return false;
		}

		return hit;
	}


	/**************************************************************/


	this.collideVerticalDown = function(level)
	{
		var permitted = this.getPermittedActions();

		var dirY = Math.sign(this.gravity);
		var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

		var hit_left = level.sensor({
			x: this.x + this.sensor_left,
			y: oriY
		}, { x: 0, y: dirY }, 256, this.sensorCallback.bind(this));

		var hit_right = level.sensor({
			x: this.x + this.sensor_right,
			y: oriY
		}, { x: 0, y: dirY }, 256, this.sensorCallback.bind(this));

		var combined = this.combineSensors([hit_left, hit_right]);

		// Determine if player is on water
		var on_water =
			(hit_left && hit_left.type == 'water' &&
			 hit_right && hit_right.type == 'water');

		var on_water_body =
			(hit_left && hit_left.type == 'waterBody' &&
			 hit_right && hit_right.type == 'waterBody');

		if(dirY > 0 && combined.min && combined.min.dy < 10) {
			// If on water and we cannot walk on water, sink and die.
			if(on_water && (!permitted.walk_on_water || Math.abs(this.velX) <= 0.1 || this.jumping)) {
				if(combined.min.dy < -8)
					this.kill("water");
				return;
			}

			if(on_water_body && (!permitted.walk_on_water || Math.abs(this.velX) <= 0.1 || this.jumping)) {
				this.kill("water");
				return;
			}

			this.y = combined.min.y - this.height;
			this.velY = 0;
			this.grounded = true;
			this.jumping = false;

			this.ground.slippery = isSlippery(combined.min.sprite);
			this.ground.type = combined.min.type;
		} else if(dirY < 0 && combined.max && combined.max.dy > -10) {
			this.y = combined.max.y;
			this.velY = 0;
			this.grounded = true;
			this.jumping = false;
		} else {
			this.grounded = false;
		}
	}


	this.collideVerticalUp = function(level)
	{
		var dirY = -Math.sign(this.gravity);
		var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

		var hit_left = level.sensor(
			{ x: this.x + this.sensor_left, y: oriY },
			{ x: 0, y: dirY }, 256, this.sensorCallback.bind(this));

		var hit_right = level.sensor(
			{ x: this.x + this.sensor_right, y: oriY },
			{ x: 0, y: dirY }, 256, this.sensorCallback.bind(this));

		var combined = this.combineSensors([hit_left, hit_right]);

		if(dirY < 0 && combined.max && combined.max.dy > -4) {
			this.y = combined.max.y - 6;
			this.velY = 0;
		} else if(dirY > 0 && combined.min && combined.min.dy < 4) {
			this.y = combined.min.y - this.height + 6;
			this.velY = 0;
		}
	}


	this.collideHorizontal = function(level)
	{
		// To the right
		var hit = level.sensor({
			x: this.x + this.width - 10,
			y: this.y + this.height - 20
		}, {
			x: 1,
			y: 0
		}, 256, this.sensorCallback.bind(this));


		if(hit && hit.type && hit.dx < 10) {
			this.velX = 0;
			this.x = this.x + hit.dx - 10;
		}

		// To the left
		var hit = level.sensor({
			x: this.x + 10,
			y: this.y + this.height - 20
		}, {
			x: -1,
			y: 0
		}, 256, this.sensorCallback.bind(this));

		if(hit && hit.type && hit.dx > -10) {
			this.velX = 0;
			this.x = this.x + hit.dx + 10;
		}
	}


	/*****************************************************************/


	/**
	 * Update kinematics
	 */
	this.updateKinematics = function()
	{
		if(!this.alive && !this.finished)
			return;

		var oriX = this.x;
		var oriY = this.y;

		var permitted = this.getPermittedActions();
		var level = this.parent.getObject("level");

		this.velX *= this.friction;
		this.velY += this.gravity;

		// Update position
		this.x += this.velX;
		this.y += this.velY;

		/** Resolve vertical collisions **/
		this.collideVerticalDown(level);
		this.collideVerticalUp(level);
		this.collideHorizontal(level);

		if(oriX != this.x || oriY != this.y || this.events.count != 0)
			this.sendPosition();
	}


	this.findTeleportDestination = function(x, y)
	{
		var map = this.parent.getObject('level').levelMap;

		for(var j = 0; j < map.length; j++) {
			for(var i = Math.floor(x / 32); i < map[0].length; i++) {
				if(map[j][i] == 5 * 256 + 4 || map[j][i] == 5 * 256 + 5) {
					return {x: i * 32, y: j * 32};
				}
			}
		}
	}


	/**
	 * Handle input and kinematics
	 */
	this.update = function(input)
	{
		if(!this.finished)
			this.handleInput(input);

		this.updateKinematics();

		if(this.velX < 0)
			this.faceRight = false;
		else if(this.velX > 0)
			this.faceRight = true;

		if(!this.alive && Math.abs(this.scale) < 0.01) {
			// Recreate character after it died
			this.parent.gameover();
		}
	}


	/**
	 * Function to handle simple sprite animations
	 */
	this.animate = function(base, frames)
	{
		if(this.animationBase != base) {
			this.animationStart = this.engine.timestamp;
			this.animationBase = base;
		}

		var deltaT = (this.engine.timestamp - this.animationStart) / 120;

		return Math.floor(1 + deltaT % frames);
	}


	/**
	 * Draws the dead message to the context
	 *
	 * @private
	 * @param {Context} context - Context to draw to
	 */
	this.drawDeadMessage = function(context)
	{
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.font = 'bold 20px Arial';
		context.textAlign = 'center';
		context.fillText("Oops, you died...", this.engine.getWidth() / 2, this.engine.getHeight() / 2);
		context.restore();
	}


	/**
	 * Draws the finished message to the context
	 *
	 * @private
	 * @param {Context} context - Context to draw to
	 */
	this.drawFinishedMessage = function(context)
	{
		context.save();

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.font = 'bold 20px Arial';
		context.textAlign = 'center';
		context.fillText("Congratulations, you have finished the game...", this.engine.getWidth() / 2, this.engine.getHeight() / 2);

		context.restore();
	}


	/**
	 * Draw the correct sprite based on the current state of the player
	 */
	this.draw = function(context)
	{
		var sprite = '';

		if(this.alive) {
			this.scale = lerp(this.scale, sign(this.gravity) == -1?-1:1, 0.5);
		} else {
			this.scale = lerp(this.scale, 0, 0.05);
		}

		if(!this.alive)
			this.drawDeadMessage(context);

		if(this.finished)
			this.drawFinishedMessage(context);

		// Determine whether to use running or walking sprite...
		if(Math.abs(this.velX) > 0.3) {
			sprite = this.faceRight?0x0013:0x0012;
		} else {
			sprite = this.faceRight?0x0011:0x0010;
		}

		var frameCount = 3;
		var frame = (this.getEngine().timestamp >> 7) % frameCount;

		this.parent.spriteManager.drawSprite(context, this, sprite, frame, function(context) {
			context.scale(1, this.scale);
		}.bind(this));
	}
}

Player.prototype = new BaseObject();

// Source: src/js/alien/objects/rock.js
/** @module Alien **/
/**
 * Creates new enemy object.
 *
 * @class
 * @classdesc Object representing an enemy in the alien girl game.
 */
function Rock()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'rock',
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
  }


  /**
   * Setups the enemy at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
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
  this.update = function()
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the enemy to touch the surface
     */
    var callback = function(hit) {
      if(hit.type == 'water') {
        hit.y += 24;
        hit.dy += 24;
      }
      return hit;
    }

    var hit = level.sensor(
      { x: this.x + this.width / 2, y: oriY },
      { x: 0, y: dirY }, 256, callback);

    if(dirY > 0 && hit && hit.dy < 10) {
      this.y = hit.y - this.height;
      this.velY = 0;
    }

    this.velY += this.gravity;
    this.y += this.velY;
  }


  /**
   * Draws the rock to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
  }
}

Rock.prototype = new BaseObject();

// Source: src/js/alien/objects/snail.js
/** @module Alien **/
/**
 * Creates new snail object.
 *
 * @class
 * @classdesc Object representing an snail in the alien girl game.
 */
function Snail()
{
  this.baseX = 0;
  this.baseY = 0;

  this.width = 24;
  this.height = 18;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'snail',
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
  }


  /**
   * Setups the snail at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
    this.alive = true;
  }


  /**
	 * Update stating position of the snail
	 *
	 * @param {number} x - X coordinate of snail starting location
   * @param {number} y - Y coordinate of snail starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for snail
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the snail
   */
  this.update = function(keyboard)
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the snail to touch the surface
     */
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
  }


  /**
   * Draws the snail to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    if(this.alive) {
      this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
    } else {
      this.parent.spriteManager.drawSprite(context, this, this.sprite + 2, 0);
    }
  }
}

Snail.prototype = new BaseObject();

// Source: src/js/alien/objects/worm.js
/** @module Alien **/
/**
 * Creates new worm object.
 *
 * @class
 * @classdesc Object representing an worm in the alien girl game.
 */
function Worm()
{
  this.baseX = 0;
  this.baseY = 0;
  this.type = 'worm';

  this.width = 32;
  this.height = 32;

  this.velY = 0;
  this.gravity = 0.3;

  this.sprite = 0;
  this.alive = true;
  this.transform = false;


  /**
   * Serialize state to array
   */
  this.toArray = function()
  {
    return {
      'x': this.x,
      'y': this.y,
      'type': 'worm',
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
  }


  /**
   * Setups the worm at the start of the game
   */
  this.reset = function()
  {
    this.x = this.baseX;
    this.y = this.baseY;
    this.alive = true;

    this.height = 32;
    this.width = 32;
    this.transform = false;
  }


  this.kill = function()
  {
    this.alive = false;
  }


  /**
	 * Update stating position of the worm
	 *
	 * @param {number} x - X coordinate of worm starting location
   * @param {number} y - Y coordinate of worm starting location
   */
	this.setStartingPosition = function(x, y)
	{
		this.baseX = x;
		this.baseY = y;
	}


  /**
   * Set base sprite for worm
   * @param {number} sprite - ID of base sprite
   */
  this.setBaseSprite = function(sprite)
  {
    this.sprite = sprite;
  }


  /**
   * Updates the worm
   */
  this.update = function()
  {
    var level = this.parent.getObject("level");

    var dirY = Math.sign(this.gravity);
    var oriY = this.y + 10 + (dirY == 1) * (this.height - 20);

    /**
     * Make sure hitting spikes or water causes the worm to touch the surface
     */
    var callback = function(hit) {
      if(hit.type == 'water') {
        hit.y += 24;
        hit.dy += 24;
      }
      return hit;
    }

    var hit = level.sensor(
      { x: this.x + this.width / 2, y: oriY },
      { x: 0, y: dirY }, 256, callback);

    if(dirY > 0 && hit && hit.dy < 10) {
      this.y = hit.y - this.height;
      this.velY = 0;
    }

    this.velY += this.gravity;
    this.y += this.velY;

    // Check for hits with player
    var player = this.parent.getObject("player_1");

    var collision = collisionCheckX(this, player);

    if(collision && this.alive) {
      if(collisionCheckY(this, player)) {
        player.kill("worm/" + this.name);
      } else {
        var distanceY = this.y + this.height - player.y;

        this.transform = true;
        this.transformHeight = (distanceY>32)?distanceY:32;
      }
    } else {
      this.transform = false;
    }
  }


  /**
   * Draws the worm to the specified context
   *
   * @param {Context} context - Context to draw to
   */
  this.draw = function(context)
  {
    if(this.transform) {
      var height = lerp(this.height, this.transformHeight, 0.4);
      this.y += (this.height - height);
      this.height = height;
      this.parent.spriteManager.drawSprite(context, this, 0x0A10, 0);
    } else {
      var height = lerp(this.height, 32, 0.1);
      this.y += (this.height - height);
      this.height = height;

      if(this.alive)
        this.parent.spriteManager.drawSprite(context, this, this.sprite, 0);
      else
        this.parent.spriteManager.drawSprite(context, this, this.sprite + 1, 0);
    }
  }
}

Worm.prototype = new BaseObject();

//# sourceMappingURL=alien.js.map