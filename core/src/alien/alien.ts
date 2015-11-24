
interface AlienOptions
{
  canvasId?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  
  overlay?: HTMLElement;
  messageSpan?: HTMLElement;
  
  levelName: string;
  userId?: string;
  gameId?: string;
  
  sinkAddress?: string;
  ldbAddress?: string;
  resourceAddress?: string;
  
  progressBarId?: string;
  spriteBoxId?: string;
  
  editMode?: boolean;
  debugMode?: boolean;
  
  messageDuration?: number;
  
  levelOnErrorFunction?: (error: any) => void,
  levelOnLoadFunction?: () => void,
  
  gameFinishedFunction?: () => void
}


function applyAGDefaultOptions(options: AlienOptions): AlienOptions
  {
    var defaults: AlienOptions = {
      "canvasId": "game-canvas",
      "canvasWidth": 35 * 32,
      "canvasHeight": 13 * 32,
      "levelName": "demo",
      
      "sinkAddress": "http://maira-server.champalimaud.pt/games/backend/sink.php",
      "ldbAddress": "http://maira-server.champalimaud.pt/games/backend/ldb/",
      "resourceAddress": "",
      
      "messageDuration": 2500,
      
      "progressBarId": "progress-bar",
      "spriteBoxId": "spriteBox",
      //"gameStart": undefined,
      //"userId": undefined
      
      "editMode": false,
      "debugMode": false,
      
      "levelOnErrorFunction": function(error) { return; },
      "levelOnLoadFunction": function() { return; }
    };
    
    for(var key in defaults) {
      if(!(key in options))
        options[key] = defaults[key];
    }
    
    return options;
  }
  

/**
 * Loads the list of levels into a form element.
 * @param {String} element <select> Element to insert levelnames into.
 * @param {String} selected Selected item.
 */
function updateAGLevelSelector(options: AlienOptions, element, selected)
{
  options = applyAGDefaultOptions(options);
  
  jQuery.ajax(options.ldbAddress + "list_levels.php", { dataType: 'json'}).done(function(result) {
    for(let i = 0; i < result.length; i++) {
      var list = $(element);

      var li = $("<option/>")
        .appendTo(list)
        .attr('value', result[i].name)
        .text(result[i].name[0].toUpperCase() + result[i].name.slice(1));

      if(selected == result[i].name)
        li.attr('selected', 'selected');
    }
  }.bind(this));
}


/**
 * Parses a string into a boolean, leaving undefined and boolean values alone
 */
function parseBool(str)
{
  if(str === undefined || str === true || str === false)
    return str;

  str = str.toLowerCase();

  if(str == 'true' || str == 'yes' || str == 'on' || str == '1')
    return true;

  return false;
}


/**
 * Returns an object with options from the query string.
 */
function getOptionsFromQuery()
{
  var options = {
    editMode:  parseBool(getQueryField("edit")),
    debugMode: parseBool(getQueryField("debug")),
    levelName: getQueryField("level"),
    gameId:    getQueryField("game"),
    userId:    getQueryField("user")
  }

  return options;
}


class AlienGame
{
  private engine: Engine;
  public editor: Editor;
  private game: AGGame; 
  public loader: LevelLoader;
  
  private options: AlienOptions;
  
  
  setupOverlay()
  {
    // Overlay is already present
    if(this.options.overlay !== undefined)
      return;
    
    this.options.overlay = document.createElement("div");
    var element: HTMLElement = document.getElementById(this.options.canvasId);
    element.parentElement.appendChild(this.options.overlay);
        
    var style = this.options.overlay.style;
    
    style.display = "block";
    //style.position = "absolute";
    style.margin = "0px";
    style.padding = "0px";
    style.top = "0px";
    style.fontSize = "20pt";
    style.verticalAlign = "middle";
    style.textAlign = "center";
    //style.height = this.options.canvasHeight + "px";
    style.width = this.options.canvasWidth + "px";
    
    $(this.options.overlay).hide();
  }
  
  
  setupMessageSpan()
  {
    if(this.options.messageSpan !== undefined)
      return;
    
    this.options.messageSpan = document.createElement("span");    
    this.options.overlay.appendChild(this.options.messageSpan);

    var style = this.options.messageSpan.style;
    
    style.display = "block";
    style.verticalAlign = "middle";    
  }
  
  
  constructor(opxtions: AlienOptions)
  {
    this.options = applyAGDefaultOptions(opxtions);

    if(!this.options.editMode) {    
      this.setupOverlay();
      this.setupMessageSpan();
    }
    
    this.engine = new Engine();
    this.game = new AGGame(this.options);
    
    this.game.spriteManager.loadFromSpriteTable(spriteTable,
      /**
       * Update progress bar after every sprite
       */
      function(left, total) 
      {
        var element: HTMLElement;
        element = document.getElementById(this.options.progressBarId);
        
        if(!element)
          return;

        element.style.width = (total - left) / total * 100 + "%";        
      }.bind(this)
    ).then(
      /**
       * Setup game after sprites have been loaded
       */
      function() 
      {
        var main = this.game;
        
        /**
         * Setup editor and sprite list
         */
        if(this.options.editMode) {
          this.editor = new Editor(this.game);
          var spriteBox = new SpriteBox(this.options.spriteBoxId, this.editor, spriteTable); 
          
          main = this.editor;
        }
        
        /**
         * Initialize engine
         */
        var height = this.options.canvasHeight + 64 * (this.options.editMode?1:0);
        
        this.engine.initializeEngine(this.options.canvasId, this.options.canvasWidth, height, main);
        this.engine.debugMode = this.options.debugMode;
        
        console.log("Options", this.options);
        
        /**
         * Load level
         */
        this.loader = new LevelLoader(this.options, this.game);
        
        this.loader.loadLevel(this.options.levelName).then(function(response) {
          this.game.reset();
          
          if(this.options.levelOnLoadFunction)
            this.options.levelOnLoadFunction();
      }.bind(this), 
      
      /**
       * Error
       */
      function(error) {
        if(this.options.levelOnErrorFunction)
          this.options.levelOnErrorFunction(error);
      }.bind(this));
    }.bind(this));    
  }
  
  loadLevel(name: string): Promise<{}>
  {
    this.loader = new LevelLoader(this.options, this.game);
    
    return this.loader.loadLevel(name);
  }
  
  saveLevel(name: string): Promise<{}>
  {
    return this.loader.saveLevel(name);
  }
  
}