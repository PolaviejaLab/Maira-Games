/** @module Common **/
"use strict";


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
