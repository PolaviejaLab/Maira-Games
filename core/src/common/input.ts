/** @module Common **/
"use strict";


interface Mouse
{
}


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
class Keyboard
{
	KEY_BACKSPACE: number = 8;
	KEY_TAB:number = 9;

	KEY_ENTER:number = 13;
	KEY_SHIFT:number = 16;
	KEY_CTRL:number = 17;
	KEY_ALT:number = 18;

	KEY_PAUSE:number = 19;
	KEY_CAPS:number = 20;
	KEY_ESCAPE:number = 27;

	KEY_SPACE:number = 32;

	KEY_LEFT:number = 37;
	KEY_UP:number = 38;
	KEY_RIGHT:number = 39;
	KEY_DOWN:number = 40;

	KEY_A:number = 65;
	KEY_B:number = 66;
	KEY_C:number = 67;
	KEY_D:number = 68;
	KEY_E:number = 69;
	KEY_F:number = 70;
	KEY_G:number = 71;
	KEY_H:number = 72;
	KEY_I:number = 73;
	KEY_J:number = 74;
	KEY_K:number = 75;
	KEY_L:number = 76;
	KEY_M:number = 77;
	KEY_N:number = 78;
	KEY_O:number = 79;
	KEY_P:number = 80;
	KEY_Q:number = 81;
	KEY_R:number = 82;
	KEY_S:number = 83;
	KEY_T:number = 84;
	KEY_U:number = 85;
	KEY_V:number = 86;
	KEY_W:number = 87;
	KEY_X:number = 88;
	KEY_Y:number = 89;
	KEY_Z:number = 90;

	keys: { [key: number]: boolean } = {};

	constructor()
	{
		document.body.addEventListener("keydown", this.onkeydown.bind(this));
		document.body.addEventListener("keyup", this.onkeyup.bind(this));
	}
	
	onkeydown(event: KeyboardEvent): void 
	{
		this.keys[event.keyCode] = true;
	}

	onkeyup = function(event: KeyboardEvent): void 
	{
		this.keys[event.keyCode] = false;
	}
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
		cancelable: true
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
