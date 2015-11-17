/** @module Alien **/
"use strict";


interface GroundInterface
{
	slippery: boolean;
	type: any;
}


interface CombinedSensorInterface
{
	min: SensorInterface;
	max: SensorInterface;
}


interface PermittedActionsInterface
{
	walk_on_water: boolean;
	fly: boolean;
	walk_upside_down: boolean;
	super_jump: boolean;
}


/**
 * Implements player in alien girl game, it is reponsible for input/movement,
 * kinematics, visual representation, collision handling.
 *
 * @class
 * @classdesc Represents the player in the alien girl game.
 */
class AGPlayer extends GraphicalObject
{
	public type: string;
	
	public alive: boolean;
	public gameover: boolean;
	public faceRight: boolean;
	public finished: boolean;
	
	private ground: GroundInterface;
	private lastFlip: number;
	
	public jumping: boolean;
	public super_jumping: boolean;
	public grounded: boolean;
	
	private gravity: number;
	
	private scale: number;
	private velX: number;
	public velY: number;
	
	private speed: number;
	private speedDefault: number = 3.5;
	private speedSnow: number = 7.0;
	
	private jumpMultiplier: number = 7.0;
	private superJumpMultiplier: number = 10.0;
	
	private friction: number;
	private frictionDefault: number = 0.8;
	private frictionDown: number = 0.7;
	private frictionSnow: number = 0.999;
	
	private slideAccelerationSnow: number;
	
	private sensor_left: number;
	private sensor_right: number;
	
	private animationStart: number;
	private animationBase: number;
	
	public events: any[];
	private collisionObjects: any;
	
	constructor()
	{
		super()
		
		this.setStartingPosition(0, 0);
		this.setDimensions(32, 46);
		
		this.type = "player";
		
		this.sensor_left = 6;
		this.sensor_right = 23;

		this.events = [];
		this.collisionObjects = [];
	}

	
	/**
	* Creates an array with collision objects
	* these objects are used to test for collisions
	* the level itself is always tested against.
	*/
	buildCollisionObjectList(): void
	{
		this.collisionObjects = [];
	
		var names = this.parent.getObjectNames();
	
		for(var i = 0; i < names.length; i++) {
			var object = this.parent.getObject(names[i]);
			var collider = object.getComponent("collider");
	
			if(collider === undefined)
				continue;
	
			if(object.type == 'rock' ||
				object.type == 'platform' ||
				object.type == 'hitswitch')
				this.collisionObjects.push(collider);
		}
	}
	
	
	reset(): void
	{
		this.engine = this.getEngine();
	
		// Position
		this.resetPosition();
	
		this.faceRight = true;
	
		// Velocities
		this.velX = 0;
		this.velY = 0;
	
		this.speed = this.speedDefault;

		this.jumping = false;
		this.super_jumping = false;
		this.grounded = false;
	
		this.ground = { slippery: false, type: true }
	
		// Physics parameters
		this.gravity = 0.3;
		this.friction = this.frictionDefault;
	
		this.slideAccelerationSnow = 0.5;
	
		this.scale = 1;
		this.alive = true;
		this.finished = false;
	
		// Setup collision boxes for the player
		if(this.getComponent('collider') === undefined)
			this.setupCollider();
	
		this.buildCollisionObjectList();
	
		this.events.push("RESTART");
	}
	
	
	/**
	* Creates a collider
	*/
	setupCollider(): void
	{
		// Create collider
		var collider = new Collider();
	
		// Player body
		var boxBody = new Box(1, 8, this.width - 4, this.height - 18);
		boxBody.type = 'body';
		collider.push(boxBody);
	
		// Player legs
		var boxLegs = new Box(7, this.height - 10, this.width - 15, 10);
		boxLegs.type = 'legs';
		collider.push(boxLegs);
		
		this.addComponent("collider", collider);
	}
	
	
	/**
	* Serialize state to array
	*/
	toArray()
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
	fromArray(array): void
	{
		this.setStartingPosition(array.x, array.y);
	}
	
	
	/**
	* Terminates the player
	*
	* @param {String} Reason the player was killed
	*/
	kill(reason: string, sprite?: number): void
	{
		var game = <AGGame> this.parent;
		game.died(reason, sprite);
	
		if(this.alive) {
			this.events.push("DIED_" + reason.toUpperCase());
			this.sendPosition();
		}
	
		this.alive = false;
	}
		
	
	/**
	* Send position to server
	*/
	sendPosition(): void
	{
		var game: AGGame = <AGGame> this.parent;
		game.sink.appendData({
			timestamp: Date.now() / 1000,
			x: this.x / 32,
			y: this.y / 32,
			event: JSON.stringify(this.events)
		});
	
		this.events = [];
	}
	
	
	getPermittedActions(): PermittedActionsInterface
	{
		var x = Math.floor(this.x / 32);
		var y = Math.floor(this.y / 32);
	
		var level: AGLevel = <AGLevel> this.parent.getObject("level");
		var code = level.levelMap[0][x] - 2304;
	
		return {
			walk_on_water: code == 1,
			fly: code == 2,
			walk_upside_down: code == 3,
			super_jump: code == 4,
		};
	}
	
	
	handleInput(input: Keyboard): void
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
				this.velY = -sign(this.gravity) * this.jumpMultiplier;
			}
		}
	
		if(input.keys[input.KEY_UP]) {
			if(this.jumping && permitted.super_jump && !this.super_jumping) {
				this.super_jumping = true;
				this.velY = -sign(this.gravity) * this.superJumpMultiplier;
			}
		}
	
		// Flip gravity if up and down are pressed at the same time
		if(input.keys[input.KEY_UP] && input.keys[input.KEY_DOWN])
		{
			// Allow wait at least 200ms before next flip
			if(permitted.walk_upside_down && (!this.lastFlip || this.engine.getTimestamp() - this.lastFlip > 200))
			{
				this.lastFlip = this.engine.getTimestamp();
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
	combineSensors(sensors: SensorInterface[]): CombinedSensorInterface
	{
		var minSensor: SensorInterface = undefined;
		var maxSensor: SensorInterface = undefined;
	
		for(var i = 0; i < sensors.length; i++) {
			if(!sensors[i] || !sensors[i].type)
				continue;
	
			if(minSensor === undefined || sensors[i].y < minSensor.y)
				minSensor = sensors[i];
	
			if(maxSensor === undefined || sensors[i].y > maxSensor.y)
				maxSensor = sensors[i];
		}
	
		return { min: minSensor, max: maxSensor };
	}
	
	
	sensorCallback(hit: SensorInterface): SensorInterface
	{
		var game = <AGGame> this.parent;
		
		if(hit.type == "exit") {
			if(hit.dx == 0 && !this.finished) {
				this.events.push("EXIT");				
				this.finished = true;
				game.finished();
			}
	
			return undefined;
		}
	
		return hit;
	}
	
	
	/**************************************************************/
	

	hitGround(sprite: number, type: string): void
	{
		this.velY = 0;
		this.grounded = true;
		this.jumping = false;
		this.super_jumping = false;
	
		this.ground.slippery = isSlippery(sprite);
		this.ground.type = type;
	}
	
	
	collideVerticalDown(level: AGLevel): void
	{
		var permitted = this.getPermittedActions();
	
		var dirY = Math.sign(this.gravity);
		var oriY = this.y + 10 + (dirY == 1?1:0) * (this.height - 20);
	
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
					this.kill("water", combined.min.sprite);
				return;
			}
	
			if(on_water_body && (!permitted.walk_on_water || Math.abs(this.velX) <= 0.1 || this.jumping)) {
				this.kill("water", combined.min.sprite);
				return;
			}
	
			this.y = combined.min.y - this.height;
			this.hitGround(combined.min.sprite, combined.min.type);
		} else if(dirY < 0 && combined.max && combined.max.dy > -10) {
			this.y = combined.max.y;
			this.velY = 0;
			this.grounded = true;
			this.jumping = false;
		} else {
			this.grounded = false;
		}
	}
	
	
	collideVerticalUp(level: AGLevel): void
	{
		var dirY = -Math.sign(this.gravity);
		var oriY = this.y + 10 + (dirY == 1?1:0) * (this.height - 20);
	
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
	
	
	collideHorizontal(level: AGLevel): void
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
	updateKinematics(): void
	{
		if(!this.alive && !this.finished)
			return;
	
		var oriX = this.x;
		var oriY = this.y;
	
		var permitted = this.getPermittedActions();
		var level = <AGLevel> this.parent.getObject("level");
	
		this.velX *= this.friction;
		this.velY += this.gravity;
	
		// Update position
		this.x += this.velX;
		this.y += this.velY;
	
		/** Resolve vertical collisions **/
		this.collideVerticalDown(level);
		this.collideVerticalUp(level);
	
		for(var i = 0; i < this.collisionObjects.length; i++) {
			var collider = <Collider> this.collisionObjects[i];
			var object = <GraphicalObject> collider.parent;
			var box = collider.getItem(0);
	
			var collision = collisionCheck(this, box);

			if(collision === undefined)
				continue;
	
			if(collision.axis == 'x') {
				this.x += collision.normal.x;
				this.velX = 0;
			} else {
				this.y += collision.normal.y;
				this.hitGround(object.sprite, object.type);
			}
		}
	
		/** Resolve sideways collisions **/
		this.collideHorizontal(level);
	
		if(oriX != this.x || oriY != this.y || this.events.length != 0)
			this.sendPosition();
	}
	
	
	findTeleportDestination(x: number, y: number): Point
	{
		var level: AGLevel = <AGLevel> this.parent.getObject('level');
		var map = level.levelMap;
	
		for(var j = 0; j < map.length; j++) {
			for(var i = Math.floor(x / 32); i < map[0].length; i++) {
				if(map[j][i] == 5 * 256 + 4 || map[j][i] == 5 * 256 + 5) {
					return {x: i * 32, y: j * 32};
				}
			}
		}
		
		return undefined;
	}
	
	
	/**
	* Handle input and kinematics
	*/
	update(input: Keyboard): void
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
			var game: AGGame = <AGGame> this.parent;
			game.gameover();
		}
	}
	
	
	/**
	* Function to handle simple sprite animations
	*/
	animate(base, frames): number
	{
		if(this.animationBase != base) {
			this.animationStart = this.engine.getTimestamp();
			this.animationBase = base;
		}
	
		var deltaT = (this.engine.getTimestamp() - this.animationStart) / 120;
	
		return Math.floor(1 + deltaT % frames);
	}
	
		
	
	/**
	* Draw the correct sprite based on the current state of the player
	*/
	draw(context: CanvasRenderingContext2D): void
	{
		var sprite: number;
		var game: AGGame = <AGGame> this.parent;
	
		// Flip player when gravity is inverted
		if(this.alive) {
			this.scale = lerp(this.scale, sign(this.gravity) == -1?-1:1, 0.5);
		} else {
			this.scale = lerp(this.scale, 0, 0.05);
		}	
	
		// Determine whether to use running or walking sprite...
		if(Math.abs(this.velX) > 0.3) {
			sprite = this.faceRight?0x0013:0x0012;
		} else {
			sprite = this.faceRight?0x0011:0x0010;
		}
	
		var frameCount = 3;
		var frame = (this.getEngine().getTimestamp() >> 7) % frameCount;
	
		game.spriteManager.drawSprite(context, this, sprite, frame, function(context) {
			context.scale(1, this.scale);
		}.bind(this));
	}
}