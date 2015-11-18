
class Transform extends GameComponent
{
	private position: Point; 
	private defaultPosition: Point;


	setPosition(x: number, y: number): void
	{
		this.position.x = x;
		this.position.y = y;
	}
	

	getPosition(): Point
	{
		return this.position;
	}	
	
	
	/**
	 * Update stating position of the bomb
	 *
	 * @param {number} x - X coordinate of enemy starting location
	 * @param {number} y - Y coordinate of enemy starting location
	 */
	setDefaultPosition(x: number, y: number): void
	{
		this.defaultPosition.x = x;
		this.defaultPosition.y = y;
	}
  
  
	resetPosition(): void
	{
		this.position 
			= this.defaultPosition;
	}	
}
