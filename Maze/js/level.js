
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


	/**
	 * Initialize level and graphics, called after
	 * adding the level layer to the game engine.
	 */
	this.setup = function()
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

		this.solve();
	}


	this.update = function(input)
	{
	}


	/**
	 *
	 */
	this.findStartPosition = function(level)
	{
		var position = {x: 1, y: 1};

		for(var i = 0; i < level.length; i++) {
			for(var j = 0; j < level[0].length; j++) {
				if (level[i][j] == 3){
					position.x = j;
					position.y = i;
				}
			}
		}

		return position;
	}


	/**
	 * Returns a copy of the level
	 */
	this.copyLevel = function(level)
	{
		var copy = [[0]];

		for(var i = 0; i < level.length; i++) {
			copy[i] = [];

			for(var j = 0; j < level[i].length; j++)
				copy[i][j] = level[i][j];
		}

		return copy;
	}


	this.findNextMove = function(level, position)
	{
		if(level[position.y][position.x - 1] == 0 && level[position.y][position.x - 2] == 0)
			return { x: position.x - 2, y: position.y };

		if(level[position.y][position.x + 1] == 0 && level[position.y][position.x + 2] == 0)
			return { x: position.x + 2, y: position.y };

		if(level[position.y - 1][position.x] == 0 && level[position.y - 2][position.x] == 0)
			return { x: position.x, y: position.y - 2 };

		if(level[position.y + 1][position.x] == 0 && level[position.y + 2][position.x] == 0)
			return { x: position.x, y: position.y + 2 };

		return false;
	}


	/**
	 * Solve level, finding a way to the goal
	 */
	this.solve = function()
	{
		// 27 * 2 = 55, 1
		var scratch = this.copyLevel(this.levelMap);
		var pos = this.findStartPosition(this.levelMap);

		scratch[pos.y][pos.x] = 1;

		var stack = new Array();
		stack.push(pos);

		for(var i = 0; i < 999; i++) {
			var move = this.findNextMove(scratch, pos);

			if(move) {
				scratch[pos.y][pos.x] = 9;
				pos = move;
				stack.push(move);

			} else {
				scratch[pos.y][pos.x] = 10;
				pos = stack.pop();
			}

			console.log(pos);
			if(pos.x == 53 && pos.y == 1)
				break;
		}

		while(stack.length > 0) {
			var pos = stack.pop();
			scratch[pos.y][pos.x] = 11;
		}

		this.solution = scratch;
	}


	/**
	 * Draw entire level
	 */
	this.draw = function(context)
	{
		for(var i = 0; i < this.levelMap.length; i++) {
			for(var j = 0; j < this.levelMap[0].length; j++) {

				// Determine horizontal width
				if(j % 2 == 0) {
					x = j*(widthspace+widthwall)/2;
					w = widthwall;
				} else {
					x = (j-1)*(widthspace+widthwall)/2 + widthwall;
					w = widthspace;
				}

				// Determine vertical width
				if(i % 2 == 0) {
					y = i*(widthspace+widthwall)/2;
					h = widthwall;
				} else {
					y = (i-1)*(widthspace+widthwall)/2 + widthwall;
					h = widthspace;
				}

				// Blank out square, some browsers paint
				// background black in fullscreen mode
				context.fillStyle = '#FFFFFF';
				context.fillRect(x, y, w, h);

				if (this.levelMap[i][j] == 1){
					context.fillStyle="#000000";
					context.fillRect(x, y, w, h);
				}

				if (this.levelMap[i][j] == 2){
					context.drawImage(this.bombImage, x, y, w, h);
				}

				if(this.solution[i][j] == 10) {
					context.fillStyle = "#FFEEEE";
					context.fillRect(x, y, w, h);
				}

				if(this.solution[i][j] == 11) {
					context.fillStyle = "#EEFFEE";
					context.fillRect(x, y, w, h);
				}
			}
		}
	}
}


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

	this.setup();
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
		this.setup();
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
