
function Collider()
{
}

Collider.prototype = Array.prototype;

Collider.prototype.draw = function(context)
{
  for(var i = 0; i < this.length; i++)
    this[i].draw(context);
}
