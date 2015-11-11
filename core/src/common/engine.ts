/** @module Common **/
"use strict";


interface Sensor extends Object {
	isActive: () => boolean;
}


interface Actor extends Object {
	setState: (boolean) => void;
}


interface ControlGroup {
	sensors: { [key: string]: Sensor };
	actors: { [key: string]: Actor };
	active: boolean;
} 


/**
 * Game engine - responsible for render loop
 * @class
 */
class Engine
{
	private controlGroups: { [key: string]: ControlGroup } = {};
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	
	private editMode: boolean;
	private debugMode: boolean;
	
	private game: Object;
	
	private input: Keyboard;
	private mouse: Mouse;
	

	/**
 	 * Returns the controlGroup identified by the specified controlGroupId
 	 */
	getControlGroup(controlGroupId: number): ControlGroup
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
	addSensorToControlGroup(controlGroupId: number, sensor: Sensor): void
	{
		var controlGroup: ControlGroup = this.getControlGroup(controlGroupId);
		var name: string = sensor.getName();
	
		if(!(name in controlGroup.sensors)) {
			controlGroup.sensors[name] = sensor;
		}
	}

	
	removeSensorFromControlGroup(controlGroupId: number, sensor: Sensor): void
	{
		var controlGroup = this.getControlGroup(controlGroupId);
		var name = sensor.getName();
	
		if(name in controlGroup.sensors)
			delete controlGroup.sensors[name];
	}
	
	
	/**
	* Adds and actor to a control group
	*/
	addActorToControlGroup(controlGroupId: number, actor: Actor): void
	{
		var controlGroup = this.getControlGroup(controlGroupId);
		var name = actor.getName();
	
		if(!(name in controlGroup.actors)) {
			controlGroup.actors[name] = actor;
		}
	}
	
	
	removeActorFromControlGroup(controlGroupId: number, actor: Actor): void
	{
		var controlGroup = this.getControlGroup(controlGroupId);
		var name = actor.getName();
	
		if(name in controlGroup.actors)
			delete controlGroup.actors[name];
	}
	
	
	updateControlGroupsState(): void
	{
		for(var key in this.controlGroups) {
			// Determine state of sensors / control group
			var state = true;
	
			for(var sensor in this.controlGroups[key].sensors) {
				state = state && this.controlGroups[key].sensors[sensor].isActive();
			}
	
			// Activate actors
			for(var actor in this.controlGroups[key].actors) {
				this.controlGroups[key].actors[actor].setState(state);
			}
		}
	}
	
	
	initializeEngine(element: string, width: number, height: number, game: Object)
	{
		this.canvas = <HTMLCanvasElement> document.getElementById(element);
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
	getWidth(): number
	{
		return this.canvas.width;
	};

	
	/**
	* Returns height of the game window
	*/
	getHeight(): number
	{
		return this.canvas.height;
	};
	
	
	/**
	* Set size of the game window.
	*
	* @param {Number} width - Width of the game window
	* @param {Number} height - Height of the game window
	*/
	setSize = function(width :number, height: number): void
	{
		this.canvas.width = width;
		this.canvas.height = height;
	};
	
	
	/**
	* Update game state and then render frame
	*/
	update = function(timestamp: number): void
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

}