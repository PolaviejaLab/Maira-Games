
class Collider extends GameComponent
{
  private elements: any[];
  
  constructor()
  {
    super();
    
    this.elements = [];
  }
  
  draw(context)
  {  
    for(var i = 0; i < this.elements.length; i++)
      this.elements[i].draw(context);
  }
  
  push(item: any)
  {
    this.elements.push(item);
  }
  
  length(): number
  {
    return this.elements.length;
  }
  
  getItem(index: number): any
  {
    return this.elements[index];
  }
}
