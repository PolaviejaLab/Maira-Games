/** @module Alien **/
"use strict";


function Box(x, y, width, height)
{
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}


/**
 * Checks whether this box completely contains the box.
 */
Box.prototype.contains = function(box)
{
  return box.x >= this.x && box.x + box.width <= this.x + this.width &&
         box.y >= this.y && box.y + box.height <= this.y + this.height;
}


/**
 * Checks whether this box contains a given point
 */
Box.prototype.containsPoint = function(point)
{
  return point.x >= box.x && point.x <= box.x + box.width &&
         point.y >= box.y && point.y <= box.y + box.height;
}


Box.prototype.intersects = function(box)
{
  var gapYA = this.y - (box.y + box.height);
	var gapYB = box.y - (this.y + this.height);

  var gapXA = this.x - (box.x + box.width);
	var gapXB = box.x - (this.x + this.width);

  if(gapXA >= 0 || gapXB >= 0 || gapYA >= 0 || gapYB >= 0)
		return false;

  return true;
}


Box.prototype.draw = function(context, color)
{
  context.beginPath();
  context.moveTo(this.x, this.y);
  context.lineTo(this.x + this.width, this.y);
  context.lineTo(this.x + this.width, this.y + this.height);
  context.lineTo(this.x, this.y + this.height);
  context.closePath();
  context.strokeStyle = color;
  context.stroke();
}


function BoxArray()
{
  this.query = function(box)
  {
    var boxesInRange = [];

    for(var i = 0; i < this.bucket.length; i++) {
      if(box.intersects(this.bucket[i]))
        boxesInRange.push(this.bucket[i]);
    }

    return boxesInRange;
  }
}


BoxArray.prototype = Array.prototype;


function QuadTree(parent, boundary)
{
  //console.log("Created new QuadTree with boundary: ", boundary);

  // Parent of this QuadTree
  this.parent = parent;

  // Boundary of this quadtree
  this.boundary = boundary;

  // Contains objects
  this.bucket = [];
  this.bucketSize = 16;

  // Subdivisions
  this.northWest = undefined;
  this.northEast = undefined;
  this.southWest = undefined;
  this.southEast = undefined;
}


/**
 * Returns all boxes (partially) within the specified box.
 */
QuadTree.prototype.query = function(box, partials)
{
  // Return objects that are partially contained by default
  if(partials === undefined)
    partials = true;

  var boxesInRange = [];

  // If box is actually an array of boxes, return all boxes
  // (partially) within any of them.
  if('length' in box) {
    for(var i = 0; i < box.length; i++)
      Array.prototype.push.apply(boxesInRange, this.query(box[i], partials));
    return boxesInRange;
  }

  if(!this.boundary.intersects(box))
    return boxesInRange;

  for(var i = 0; i < this.bucket.length; i++) {
    if(partials && box.intersects(this.bucket[i]))
      boxesInRange.push(this.bucket[i]);
    if(!partials && box.contains(this.bucket[i]))
      boxesInRange.push(this.bucket[i]);
  }

  if(this.northWest === undefined)
    return boxesInRange;

  Array.prototype.push.apply(boxesInRange, this.northWest.query(box, partials));
  Array.prototype.push.apply(boxesInRange, this.northEast.query(box, partials));
  Array.prototype.push.apply(boxesInRange, this.southWest.query(box, partials));
  Array.prototype.push.apply(boxesInRange, this.southEast.query(box, partials));

  return boxesInRange;
}


/**
 * Insert an object into this branch. Returns false
 *  if the object does not belong here.
 */
QuadTree.prototype.insert = function(object)
{
  // The object does not belong in this QuadTree
  if(!this.boundary.contains(object))
    return false;

  // Subdivide if bucket is full
  if(this.bucket.length >= this.bucketSize)
    this.subdivide();

  if(this.northWest !== undefined) {
    if(this.northWest.insert(object))
      return true;
    if(this.northEast.insert(object))
      return true;
    if(this.southEast.insert(object))
      return true;
    if(this.southWest.insert(object))
      return true;
  }

  this.bucket.push(object);

  return true;
}


/**
 * Redistributes the boxes in our bucket over the child branches
 *  if the object does not belong in this branch, send it back
 *  to the parent.
 */
QuadTree.prototype.redistribute = function()
{
  // No quadrants, return
  if(this.northWest === undefined)
    return;

  // Reinsert items into structure
  var oldBucket = this.bucket;
  this.bucket = [];

  //console.log("Redistributing " + oldBucket.length + " items");

  for(var i = 0; i < oldBucket.length; i++) {
    if(this.insert(oldBucket[i]))
      continue;

    // Inserting failed, verify that parent exists
    if(this.parent === undefined) {
      console.log("Object does not belong in this tree, inserting it at the root", object);
      this.bucket.push(object);
      continue;
    }

    // And attempt to insert into parent
    this.parent.insert(oldBucket[i]);
  }
}


QuadTree.prototype.subdivide = function()
{
  // Ignore if already subdivided
  if(this.northWest !== undefined)
    return;

  var boundary = this.boundary;

  var x0 = boundary.x;
  var y0 = boundary.y;
  var x1 = boundary.x + boundary.width / 2;
  var y1 = boundary.y + boundary.height / 2;
  var x2 = boundary.x + boundary.width;
  var y2 = boundary.y + boundary.height;

  this.northWest = new QuadTree(this, new Box(x0, y0, x1 - x0, y1 - y0));
  this.northEast = new QuadTree(this, new Box(x1, y0, x2 - x1, y1 - y0));
  this.southWest = new QuadTree(this, new Box(x0, y1, x1 - x0, y2 - y1));
  this.southEast = new QuadTree(this, new Box(x1, y1, x2 - x1, y2 - y1));

  this.redistribute();
}


QuadTree.prototype.draw = function(context)
{
  for(var i = 0; i < this.bucket.length; i++) {
    this.bucket[i].draw(context, 'blue');
  }

  if(this.northWest !== undefined) {
    this.northWest.draw(context);
    this.northEast.draw(context);
    this.southEast.draw(context);
    this.southWest.draw(context);
  }

  this.boundary.draw(context, 'green');
}
