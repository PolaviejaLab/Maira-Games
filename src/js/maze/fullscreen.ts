/** @module Maze **/
"use strict";

document.cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;

document.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    case 13: // ENTER. ESC should also take you out of fullscreen by default.
      e.preventDefault();
      document.cancelFullScreen();
      break;
    case 70: // f
      enterFullscreen();
      break;
  }
}, false);


/**
 * Create onFullScreenEnter event when entering fullscreen
 */
function onFullScreenEnter() {
  var elem = document.querySelector("#fullscreen");

  if(!elem) {
    console.log("Could not find element");
    return;
  }

  elem.onfullscreenchange = onFullScreenExit;
  elem.onwebkitfullscreenchange = onFullScreenExit;
  elem.onmozfullscreenchange = onFullScreenExit;

  console.log("Entering full screen");

  var event = new CustomEvent("onFullScreenEnter", {
    bubbles: false,
  	cancellable: true
  });

  document.dispatchEvent(event);
}


/**
 * Create onFullScreenExit event when exiting fullscreen
 */
function onFullScreenExit() {
  var event = new CustomEvent("onFullScreenExit", {
    bubbles: false,
  	cancellable: true
  });

  document.dispatchEvent(event);
}


/**
 * Enter fullscreen mode
 *
 * Note: FF nightly needs about:config full-screen-api.enabled set to true.
 */
function enterFullscreen() {
  var elem = document.querySelector("#fullscreen");

  if(!elem) {
    console.log("Could not find element");
    return;
  }

  elem.onwebkitfullscreenchange = onFullScreenEnter;
  elem.onmozfullscreenchange = onFullScreenEnter;
  elem.onfullscreenchange = onFullScreenEnter;

  requestFullscreen(elem);

  var button = document.getElementById('enter-exit-fs');

  if(button !== null)
    button.onclick = exitFullscreen;
}


/**
 * Explicitly exit fullscreen mode
 */
function exitFullscreen() {
  exitFullscreen();

  var button = document.getElementById('enter-exit-fs');

  if(button !== null)
    button.onclick = enterFullscreen;
}


/**
 * Displays element fullscreen and fulfills promise when done.
 */
function requestFullscreen(elem)
{
  return new Promise(function(resolve, reject) {

    var fullscreenchange = function() {
      elem.onfullscreenchange = null;
      if(isFullscreen())
        resolve();
      else
        reject(Error("element.requestFullscreen() failed"));
    }

    elem.onfullscreenchange = fullscreenchange
    elem.onwebkitfullscreenchange = fullscreenchange;
    elem.onmozfullscreenchange = fullscreenchange;

    var fullscreenerror = function() {
      reject(Error("element.requestFullscreen() failed"));
    }

    elem.onfullscreenerror = fullscreenerror;
    elem.onwebkitfullscreenerror = fullscreenerror;
    elem.onmozfullscreenerror = fullscreenerror;

    var promise = undefined;

    if(elem.requestFullscreen)
      promise = elem.requestFullscreen();
    else if(elem.mozRequestFullScreen)
      promise = elem.mozRequestFullScreen();
    else if(elem.webkitRequestFullscreen)
      promise = elem.webkitRequestFullscreen();
    else if(elem.msRequestFullscreen)
      promise = elem.msRequestFullscreen();
    else
      reject(Error("element.requestFullscreen() is not supported"));

    if(promise !== undefined)
      promise.then(function() { resolve(); });
  });
}


/**
 * Stops document's fullscreen element from being displayed
 * fullscreen and fulfills promise when done.
 */
function exitFullscreen()
{
  if(document.exitFullscreen)
    return document.exitFullscreen();
  if(document.mozCancelFullscreen)
    return document.mozCancelFullscreen();
  if(document.webkitExitFullscreen)
    return document.webkitExitFullscreen();
  if(document.msExitFullscreen)
    return document.msExitFullscreen();

  return new Promise(function(resolve, reject) {
    reject(Error("element.exitFullscreen() is not supported"));
  });
}


function isFullscreen()
{
  return document.mozFullScreen ||
         document.webkitIsFullScreen;
}
