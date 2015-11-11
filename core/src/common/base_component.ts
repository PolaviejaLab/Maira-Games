/** @module Common **/
"use strict";


interface Component
{  
}


/**
 * Base class for game components.
 *
 * @class
 */
function BaseComponent()
{
  this.parent = undefined;
}


BaseComponent.prototype.draw = function(context)
{
}
