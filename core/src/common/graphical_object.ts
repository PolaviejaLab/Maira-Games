
class GraphicalObject extends GameObject
{
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  
  private baseX: number;
  private baseY: number;
  
  
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