/** @module Maze **/
"use strict";


/**
 * Main class for maze game
 *
 * @class
 * @augments Engine
 */
function Game(options)
{
  this.widthwall = 1.5;
	this.widthspace = 44;

  /**
	 * If options have been defined, use them instead
	 */
	if(options !== undefined) {
		if('widthwall' in options)
			this.widthwall = options.widthwall;

		if('widthspace' in options)
			this.widthspace = options.widthspace;
	}
}

Game.prototype = new BaseObject();
