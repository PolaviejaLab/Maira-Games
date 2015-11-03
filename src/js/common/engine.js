/** @module Common **/
"use strict";


/**
 * Game engine - responsible for render loop
 * @class
 */
function Engine()
{
	this.controlGroups = {};
}


/**
 * Returns the controlGroup identified by the specified controlGroupId
 */
Engine.prototype.getControlGroup = function(controlGroupId)
{
	if(!(controlGroupId in this.controlGroups)) {
		this.controlGroups[controlGroupId] = {
			'sensors': {},
			'actors': {},
			'active': false
		};
	}

	return this.controlGroups[controlGroupId];
}


/**
 * Adds a sensor to a control group
 */
Engine.prototype.addSensorToControlGroup = function(controlGroupId, sensor)
{
	var controlGroup = this.getControlGroup(controlGroupId);
	var name = sensor.getName();

	if(!(name in controlGroup.sensors)) {
		controlGroup.sensors[name] = sensor;
	}
}


Engine.prototype.removeSensorFromControlGroup = function(controlGroupId, sensor)
{
	var controlGroup = this.getControlGroup(controlGroupId);
	var name = sensor.getName();

	if(name in controlGroup.sensors)
		delete controlGroup.sensors[name];
}


/**
 * Adds and actor to a control group
 */
Engine.prototype.addActorToControlGroup = function(controlGroupId, actor)
{
	var controlGroup = this.getControlGroup(controlGroupId);
	var name = actor.getName();

	if(!(name in controlGroup.actors)) {
		controlGroup.actors[name] = actor;
	}
}


Engine.prototype.removeActorFromControlGroup = function(controlGroupId, actor)
{
	var controlGroup = this.getControlGroup(controlGroupId);
	var name = actor.getName();

	if(name in controlGroup.actors)
		delete controlGroup.actors[name];
}


Engine.prototype.updateControlGroupsState = function()
{
	for(var key in this.controlGroups) {
		// Determine state of sensors / control group
		var state = true;

		for(var sensor in this.controlGroups[key].sensors) {
			state &= this.controlGroups[key].sensors[sensor].isActive();
		}

		// Activate actors
		for(var actor in this.controlGroups[key].actors) {
			this.controlGroups[key].actors[actor].setState(state);
		}
	}
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
