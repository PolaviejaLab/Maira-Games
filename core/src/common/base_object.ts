/** @module Common **/
"use strict";


interface Object {
  parent: Object;
  engine: Engine;
  
	getName: () => string;
  
  getEngine: () => Engine;
  
  reset: () => void;
  update: (any) => void;
  draw: (CanvasRenderingContext2D) => void;
  
  getObjectNames: () => string[];
  getComponentNames: () => string[];
}


/**
 * Base class for game objects.
 *
 * @class
 */
function BaseObject()
{
  this.parent = undefined;
  this.children = {};
  this.components = {};
  this.properties = [];
}


/**
 * Returns the name of the present object
 */
BaseObject.prototype.getName = function()
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


/**
 * Reset object to its initiail state
 */
BaseObject.prototype.reset = function()
{
  this.resetChildren();
};


/**
 * Update (physics) state of current node.
 *
 * @param {Keyboard} keyboard - State of the keyboard
 */
BaseObject.prototype.update = function(keyboard)
{
  this.updateChildren(keyboard);
};


/**
 * Called when the object collides with another
 *
 * @param {String} name - Name of the other object
 * @param {BaseObject} object - Object that we collided with
 * @param {Object} details - Details of the collision
 */
BaseObject.prototype.onCollision = function(name, object, details)
{
};


/**
 * Draw the current node.
 *
 * @param {Context} context - Context to draw to
 */
BaseObject.prototype.draw = function(context: CanvasRenderingContext2D)
{
  this.drawChildren(context);
};


/**
 * Returns the Engine object.
 */
BaseObject.prototype.getEngine = function()
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
BaseObject.prototype.getObjectNames = function(): string[]
{
	return Object.keys(this.children);
};


/**
 * Return array of component names.
 */
BaseObject.prototype.getComponentNames = function(): string[]
{
	return Object.keys(this.components);
};



/**
 * Add a child object.
 *
 * @param {String} name - Name of the child object
 * @param {BaseObject} object - Object to be added
 */
BaseObject.prototype.addObject = function(name: string, object: Object)
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
BaseObject.prototype.addComponent = function(name, object)
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
BaseObject.prototype.hasObject = function(name)
{
  return name in this.children;
};


/**
 * Return whether the component exists.
 *
 * @param {String} name - Name of the component.
 * @returns {Boolean} True if the component exists, false otherwise.
 */
BaseObject.prototype.hasComponent = function(name)
{
  return name in this.component;
};


/**
 * Retreive a specific child object.
 *
 * @param {String} name - Name of the object to retreive
 * @returns {BaseObject} Returned object
 */
BaseObject.prototype.getObject = function(name)
{
	return this.children[name];
};


/**
 * Reteive a specific component object.
 *
 * @param {String} name - Name of the component to retreive
 * @returns {Component} Returned component
 */
BaseObject.prototype.getComponent = function(name: string): Component
{
  return this.components[name];
};


/**
 * Delete a specific child object.
 *
 * @param {String} name - Name of the object to delete
 */
BaseObject.prototype.deleteObject = function(name: string): void
{
	delete this.children[name];
};


/**
 * Remove all child objects.
 */
BaseObject.prototype.deleteAllObjects = function(): void
{
	this.children = {};
};


/**
 * Reset state of child objects.
 */
BaseObject.prototype.resetChildren = function(): void
{
  for(var key in this.children)
    this.children[key].reset();
};


/**
 * Update (physics) state of child objects.
 *
 * @param {Keyboard} keyboard - State of the keyboard
 */
BaseObject.prototype.updateChildren = function(keyboard): void
{
  for(var key in this.children)
    this.children[key].update(keyboard);
};


/**
 * Invoke the draw function on all children.
 *
 * @param {Context} context - Context to draw to
 */
BaseObject.prototype.drawChildren = function(context: CanvasRenderingContext2D): void
{
  for(var key in this.children)
		this.children[key].draw(context);
};
