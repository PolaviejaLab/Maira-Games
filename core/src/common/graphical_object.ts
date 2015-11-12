
class GraphicalObject extends GameObject
{
  public sprite: number = 0;
  
  public x: number = 0;
  public y: number = 0;
  public width: number = 32;
  public height: number = 32;
  
  private baseX: number = 0;
  private baseY: number = 0;
  
  
  /**
	 * Update stating position of the bomb
	 *
	 * @param {number} x - X coordinate of enemy starting location
   * @param {number} y - Y coordinate of enemy starting location
   */
	setStartingPosition(x: number, y: number): void
	{
		this.baseX = x;
		this.baseY = y;
	}
  
  
  getStartingPosition(): Point
  {
    return { 
      x: this.baseX,
      y: this.baseY 
    };
  }
  
  
  setDimensions(width: number, height: number): void
  {
    this.width = width;
    this.height = height;
  }
  
  
  resetPosition(): void
  {
    this.x = this.baseX;
    this.y = this.baseY;
  }
}