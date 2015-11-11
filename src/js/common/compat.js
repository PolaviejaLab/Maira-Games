/** @module Common **/
"use strict";

(function() {
	var requestAnimationFrame =
		window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	window.requestAnimationFrame = requestAnimationFrame;
})();


/**
 * The Date.now() function is not present in IE8 and earlier.
 */
if(!Date.now) {
	Date.now = function() {
		return new Date().getTime();
	};
}
