/** @module Alien **/
"use strict";


interface Scroll
{
  x: number;
  y: number;
}


interface Deadzone
{
  w: number;
}


/**
 * Creates main class for alien girl game.
 *
 * @class
 * @classdesc Alien girl game.
 * @augments Engine
 * @param {String} element - Name of canvas element to draw to
 * @param {number} width - Required width of canvas element
 * @param {number} height - Required height of canvas element
 */
class AGGame extends GameObject
{
  public spriteManager: any;
  
  private options: AlienOptions;
  
  private levelBounds: Box;  
  public sink: any;
  private deadzone: Deadzone;
  
  public scroll: Scroll;  
  public editMode: boolean;
  
  private numRepeats: number = 3;
  private repeatCount: number = 0;
  
  private messageTimeOutId: number;
 
  
  constructor(options: AlienOptions)
  {
    super();
    
    this.options = options;
    this.levelBounds = {x: 0, y: 0, width: 32, height: 32 };
    this.spriteManager = new SpriteManager(options);
    //this.engine = false;
    this.scroll = {x: 0, y: 0};
    this.deadzone = {w: 128};
  
    // Connection responsible for saving data on server
    this.sink = new Sink(options.sinkAddress + "?game=AG" +
        "&session=" + options.gameId +
        "&user=" + options.userId +
        "&level=" + options.levelName +
        "&debug=" + (options.debugMode?"true":"false"));
  
    this.sink.transmitEvery = 20;
  }


  /**
   * Returns message to be shown when the player gets killed
   * 
   * @param {string} reason - Reason the player was killed
   * @param {number} sprite - Sprite that caused the player to be killed
   */
  getKillMessage(reason: string, sprite: number): string
  {
    var levelName = this.options.levelName;
        
    /**
     * Parse levelName, it has the format:
     *   Level_#TaskID#_#Single/Group##Number#
     */
    var parts = levelName.split("_");
    
    if(parts.length != 2) {
      console.log("Level name does not conform to standards");
      return DiedMessages.default;
    }
    
    var taskId = parseInt(parts[1]);
    var singleGroup = parts[2][0];
    
    if(singleGroup == "g")
      return DiedMessages.default;
    
    // Task 1 has many death causes
    if(taskId == 1 && singleGroup == "s")
    {
      if(sprite == 0x0A0E) return DiedMessages.greenWorm;
      if(sprite == 0x0A13) return DiedMessages.redWorm;
      if(sprite == 0x0204 || sprite == 0x0206) return DiedMessages.waterNoWaves;
      if(sprite == 0x0203 || sprite == 0x0205) return DiedMessages.waterHugeWaves;  
      if(sprite == 0x0A03 || sprite == 0x0A04) return DiedMessages.bee;
      if(sprite == 0x0A00 || sprite == 0x0A01) return DiedMessages.fly;
    }
    
    // Died in task 2, assume it is because of slipping on the ice
    if(taskId == 2 && singleGroup == "s")
    {
      return DiedMessages.ice;
    }
    
    // Died because of quicksand in task 3
    if(taskId == 3 && singleGroup == "s")
    {
      if(sprite == 0x0115) return DiedMessages.quickSand;
    }
    
    // Died in task 4, assume it is because of door/lever state
    if(taskId == 4 && singleGroup == "s")
    {
      return DiedMessages.lever;
    }
    
    // Default message
    return DiedMessages.default;
  }


  /**
   * Returns the element to display instead of a key
   * 
   * Keys:
   *  0x#### -> sprite number
   *  ↑↓A..Za..z -> keyboard key
   */
  getElementForKey(key: string): string
  {
    if(key[0] == "0" && key[1] == "x") {
      for(var i = 0; i < spriteTable.length; i++) {
        if(spriteTable[i].key != parseInt(key))
          continue;
          
        if(spriteTable[i].frames === undefined)
          return "<img style=\"width: 20px\" src=\"tiles/" +
            spriteTable[i].src + ".png\">";
        else
          return "<img style=\"width: 20px\" src=\"tiles/" +
            spriteTable[i].src + "_0.png\">";
      }
      
      return "";
    }

    if(key == "↑")
      key = "arrow-up-icon";
    else if(key == "↓")
      key = "arrow-down-icon";
    else if(key >= "a" && key <= "z")
      key = "letter-" + key + "-icon";       
    else if(key >= "A" && key <= "Z")
      key = "letter-uppercase-" + key + "-icon";      
    
    return "<img style=\"width: 42px\" src=\"tiles/keys/" + key + ".png\">";
  }


  /**
   * Replace keys in message with HTML elements
   * 
   * @param {string} message - Original message
   * @return {string} Transformed message
   */
  transformMessage(message: string): string
  {
    var inTag: boolean = false;
    var output: string = "";
    var key: string = "";
    
    for(var i = 0; i < message.length; i++) {
      if(!inTag && message[i] == "[") {
        key = "";
        inTag = true;
      } else if(inTag && message[i] == "]") {
        output += this.getElementForKey(key);
        inTag = false;
      } else if(inTag) {
        key += message[i];
      } else {
        output += message[i];
      }
    }
        
    return output;
  }


  showMessage(message: string, duration?: number): void
  {      
    // Clear previous time-out
    if(this.messageTimeOutId)
      clearTimeout(this.messageTimeOutId);

    $(this.options.overlay).fadeIn(500);       
       
    // Set kill message
    this.options.messageSpan.innerHTML = message;

    // Set timer to remove kill message
    this.messageTimeOutId = setTimeout(function() {
      $(this.options.overlay).fadeOut(500);   
    }.bind(this), this.options.messageDuration);      
  }


  /**
   * Called when the player has died
   * 
   * @param {string} reason - Cause the player died
   * @param {number} sprite - Sprite that caused the death
   */
  died(reason: string, sprite: number): void
  {
    this.showMessage(
      this.transformMessage( 
        this.getKillMessage(reason, sprite)));
  }
  
  
  /**
   * Called when the level is over
   */
  finished(): void
  {
    this.repeatCount += 1;
    
    if(this.repeatCount < this.numRepeats) {
      var repeatsLeft = this.numRepeats - this.repeatCount;
      this.showMessage("You finished the game, now repeat it " + repeatsLeft + " more times");
  
      setTimeout(function() {
        this.reset();
      }.bind(this), this.options.messageDuration);      
    } else {
      this.showMessage("You finished the game three times, congratulations!");
      $("#" + this.options.canvasId).fadeOut(this.options.messageDuration);
      
      setTimeout(function() {
        if(this.options.gameFinishedFunction)
          this.options.gameFinishedFunction();
      }.bind(this), this.options.messageDuration);
    }
  }
  
  
  reset(): void
  {
    this.resetChildren();
  }
  
  
  update(keyboard: Keyboard): void
  {
    this.updateTranslation();
  
    if(this.editMode)
      return;
  
    this.updateChildren(keyboard);
  };
  
  
  draw(context: CanvasRenderingContext2D): void
  {
    if(!this.engine)
      throw new Error("Game: Engine object is invalid");
  
    var width = this.engine.getWidth();
    var height = this.engine.getHeight();
  
    //context.imageSmoothingEnabled = true;
    //context.scale(0.25, 0.25);
  
    context.clearRect(0, 0, width, height);
    context.translate(-this.scroll.x, -this.scroll.y);
 
    this.drawChildren(context);
  };
  
  
  /**
  * Sets the boundaries of the level
  *
  * @param {Array} bounds - Bounaries of the level
  */
  setLevelBounds(bounds: Box)
  {
    this.levelBounds = bounds;
  };
  
  
  /**
  * When the game is over, reset all objects
  * which effectively restarts the game.
  */
  gameover(): void
  {
    // Reset all objects to their default states
    this.reset();
  };
  
  
  /**
  * Start edit mode
  */
  startEditMode(): void
  {
    this.editMode = true;
  
    // Reset all objects to their default states
    for(var key in this.children)
      this.children[key].setup();
  };
  
  
  /**
  * Updates translation offset in canvas when the player exits the dead-zone.
  */
  updateTranslation = function()
  {
    var input = this.engine.input;
    var width = this.engine.getWidth();
    var height = this.engine.getHeight();
  
    // Do not use player to scroll in edit mode
    if(this.editMode) {
      return;
    }
  
    if(!this.hasObject('player_1'))
      return;
  
    var playerX = this.getObject('player_1').x;
  
    if(width >= this.levelBounds.width) {
      this.scroll.x = (width - this.levelBounds.width) / 2 - this.levelBounds.x;
      this.scroll.y = this.levelBounds.y;
      return;
    }
  
  
    // Compute boundaries of dead-zone in screen coordinates
    var deadzone_x_min = (width - this.deadzone.w) / 2;
    var deadzone_x_max = (width + this.deadzone.w) / 2;
  
    // Computer player position in screen coordinates
    var player_x_game = playerX - this.scroll.x;
  
    // Update scrolling
    if(player_x_game > deadzone_x_max) {
      this.scroll.x += player_x_game - deadzone_x_max;
    } else if(player_x_game < deadzone_x_min) {
      this.scroll.x += player_x_game - deadzone_x_min;
    }
  
    // Make sure we do not scroll past beginning/end of level
    if(this.scroll.x < this.levelBounds.x)
      this.scroll.x = this.levelBounds.x;
    if(this.scroll.x > (this.levelBounds.x + this.levelBounds.width) - width) {
      this.scroll.x = (this.levelBounds.x + this.levelBounds.width) - width;
    }
  
    // Not used in maze
    this.scroll.y = this.levelBounds.y;
  };
}