/** @module Alien **/
"use strict";

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
 * Called by container, aligns selected element
 */
Editor.prototype.alignSelected = function()
{
	if(this.selectedObject) {
		this.selectedObject.x = Math.round(this.selectedObject.x / 32) * 32;
		this.selectedObject.y = Math.round(this.selectedObject.y / 32) * 32;
	}
}


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

				this.setupOptions();

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
 * Adds options
 */
Editor.prototype.setupOptions = function()
{
	var node = document.getElementById('options');

	// Remove children
	while(node.firstChild) {
	    node.removeChild(node.firstChild);
	}

	// Add options
	var properties = this.selectedObject.properties;
	for(var i = 0; i < properties.length; i++) {
		var property = properties[i];

		var label = document.createElement('label');
		label.innerHTML = properties[i].caption;

		if(property.type == 'select') {
			var select = document.createElement('select');

			for(var j = 0; j < property.options.length; j++) {
				var option = document.createElement('option');
				option.value = property.options[j].value;
				option.innerHTML = property.options[j].caption;

				select.appendChild(option);
			}

			select.value = property.get();

			select.onchange = function(event) {
				this.set(event.target.value);
			}.bind(property);

			node.appendChild(label);
			node.appendChild(document.createElement('br'));
			node.appendChild(select);
		} else if(property.type == 'boolean') {
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = property.get();
			node.appendChild(input);
			node.appendChild(label);

			input.onchange = function(event) {
				this.set(event.target.checked);
			}.bind(property);
		} else {
			var input = document.createElement('input');
			input.type = 'text';
			input.value = property.get();

			node.appendChild(label);
			node.appendChild(input);
		}

		node.appendChild(document.createElement('br'));
	}
	//<label>Height:</label> <input type="text" style="width: 50px;">-->
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
