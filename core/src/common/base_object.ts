/** @module Common **/


/**
 * Base class for game objects.
 *
 * @class
 */
class GameObject
{
  public type: string;
  
  protected parent: GameObject;
  protected children: { [key: string]: GameObject };
  protected components: { [key: string]: GameComponent };
  public properties: any;
  
  public engine: Engine;
  
  constructor()
  {
    this.parent = undefined;
    this.children = {};
    this.components = {};
    this.properties = [];
  }



  /**
   * Returns the name of the present object
   */
  getName(): string
  {
    if(this.parent === undefined)
      return "root";

    for(var key in this.parent.children)
    {
      if(this.parent.children[key] == this)
        return key;
    }

    return "unknown";
  }


  setup(): void
  {    
  }


  /**
  * Reset object to its initiail state
  */
  reset(): void
  {
    this.resetChildren();
  };
  
  
  /**
  * Update (physics) state of current node.
  *
  * @param {Keyboard} keyboard - State of the keyboard
  */
  update(keyboard: Keyboard): void
  {
    this.updateChildren(keyboard);
  };
  
  
  /**
  * Called when the object collides with another
  *
  * @param {String} name - Name of the other object
  * @param {BaseObject} object - GameObject that we collided with
  * @param {GameObject} details - Details of the collision
  */
  onCollision(name: string, object: GameObject, details: any): void
  {
  };
  
  
  /**
  * Draw the current node.
  *
  * @param {Context} context - Context to draw to
  */
  draw(context: CanvasRenderingContext2D): void
  {
    this.drawChildren(context);
  };
  
  
  /**
  * Returns the Engine object.
  */
  getEngine(): Engine
  {
    if(this.parent === undefined)
      return this.engine;
  
    return this.parent.getEngine();
  };
  
  
  // //////////////////////////// //
  // Functions to manage children //
  // //////////////////////////// //
  
  
  /**
  * Return array of object names.
  */
  getObjectNames(): string[]
  {
    return Object.keys(this.children);
  };
  
  
  /**
  * Return array of component names.
  */
  getComponentNames(): string[]
  {
    return Object.keys(this.components);
  };
  
  
  
  /**
  * Add a child object.
  *
  * @param {String} name - Name of the child object
  * @param {BaseObject} object - GameObject to be added
  */
  addObject(name: string, object: GameObject): void
  {
    object.parent = this;
    this.children[name] = object;
    this.children[name].reset();
  };
  
  
  /**
  * Add a new component.
  *
  * @param {String} name - Name of the component object
  * @param {ComponentObject} object - Component to be added
  */
  addComponent(name: string, object: GameComponent): void
  {
    object.parent = this;
    this.components[name] = object;
  };
  
  
  /**
  * Returns whether the object exists.
  *
  * @param {String} name - Name of the object.
  * @returns {Boolean} True if the object exists, false otherwise
  */
  hasObject(name: string): boolean
  {
    return name in this.children;
  };
  
  
  /**
  * Return whether the component exists.
  *
  * @param {String} name - Name of the component.
  * @returns {Boolean} True if the component exists, false otherwise.
  */
  hasComponent(name: string): boolean
  {
    return name in this.components;
  };
  
  
  /**
  * Retreive a specific child object.
  *
  * @param {String} name - Name of the object to retreive
  * @returns {BaseObject} Returned object
  */
  getObject(name: string): GameObject
  {
    return this.children[name];
  };
  
  
  /**
  * Reteive a specific component object.
  *
  * @param {String} name - Name of the component to retreive
  * @returns {Component} Returned component
  */
  getComponent(name: string): GameComponent
  {
    return this.components[name];
  };
  
  
  /**
  * Delete a specific child object.
  *
  * @param {String} name - Name of the object to delete
  */
  deleteObject(name: string): void
  {
    delete this.children[name];
  };
  
  
  /**
  * Remove all child objects.
  */
  deleteAllObjects(): void
  {
    this.children = {};
  };
  
  
  /**
  * Reset state of child objects.
  */
  resetChildren(): void
  {
    for(var key in this.children)
      this.children[key].reset();
  };
  
  
  /**
  * Update (physics) state of child objects.
  *
  * @param {Keyboard} keyboard - State of the keyboard
  */
  updateChildren(keyboard: Keyboard): void
  {
    for(var key in this.children)
      this.children[key].update(keyboard);
  };
  
  
  /**
  * Invoke the draw function on all children.
  *
  * @param {Context} context - Context to draw to
  */
  drawChildren(context: CanvasRenderingContext2D): void
  {
    for(var key in this.children)
      this.children[key].draw(context);
  };
}
