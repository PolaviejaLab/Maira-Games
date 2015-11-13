/** @module Maze **/
"use strict";

/**
 * Object representing the player in the maze game
 * @class
 */
class MGPlayer extends GraphicalObject
{
	public sink: Sink;
	
	private playerImage: HTMLImageElement;
	
	private options: MazeOptions;
	public widthwall: number;
	public widthspace: number;
	
	public playerAngle: number;
	
	constructor(options: MazeOptions)
	{
		super()

		// Depends on sprite
		this.setDimensions(32, 46);

		this.options = options;
		
		var sessionId = options.gameStart.toString(36 | 0).toUpperCase();

		this.sink = new Sink(options.sinkAddress +
			"?game=MG&session=" + sessionId +
			"&level=" + options.levelName +
			"&user=" + options.userId +
			"&debug=false");
	}

	/**
	 * Sets up the player object
	 */
	reset()
	{
		var game = <MGGame> this.parent;
		
		// Copy wall and space width from parent
		this.widthwall = game.widthwall;
		this.widthspace = game.widthspace;

		// Find player start position
		var level = <MGLevel> this.parent.getObject("level");

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
		this.playerImage.src = this.options.resourceAddress + "images/player.png";
	}


	/**
	 * Handles player movement
	 * @param {Keyboard} Object containing keyboard state
	 */
	update(input: Keyboard)
	{
	}


	/**
	 * Attempt to moves the player one block in the specified direction
	 * @param {number} Movement in X direction (left/right)
	 * @param {number} Movement in Y direction (up/down)
	 */
	moveDirection(dx, dy)
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
	move(x, y)
	{
		var level = <MGLevel> this.parent.getObject("level");

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
	draw(context)
	{
		var x, y, w, h;

		if(this.x % 2 == 0){
			x = this.x*(this.widthspace+this.widthwall)/2;
			w = this.widthwall;
		}
		else{
			x = (this.x-1)*(this.widthspace+this.widthwall)/2 + this.widthwall;
			w = this.widthspace;
		}
		if(this.y % 2 == 0){
			y = this.y*(this.widthspace+this.widthwall)/2;
			h = this.widthwall;
		}
		else{
			y = (this.y-1)*(this.widthspace+this.widthwall)/2 + this.widthwall;
			h = this.widthspace;
		}

		context.save();
		context.translate(x + w / 2, y + h / 2);
		context.rotate(this.playerAngle * Math.PI / 180.0);

		context.drawImage(this.playerImage, -w / 2, -h / 2, w, h);
		context.restore();
	}
}
