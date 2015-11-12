/** @module Maze **/


/**
 * Main class for maze game
 *
 * @class
 * @augments Engine
 */
class MGGame extends GameObject
{
	public widthwall: number;
	public widthspace: number;
	
	constructor(options)
	{
		super()
		
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
}
