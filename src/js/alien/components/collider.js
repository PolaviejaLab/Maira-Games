
function Collider()
{
}

Collider.prototype = new Array;

Collider.prototype.draw = function(context)
{  
  for(var i = 0; i < this.length; i++)
    this[i].draw(context);
}
