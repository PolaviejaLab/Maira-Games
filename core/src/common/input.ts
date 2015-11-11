/** @module Common **/
"use strict";


interface Keyboard
{	
}


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
