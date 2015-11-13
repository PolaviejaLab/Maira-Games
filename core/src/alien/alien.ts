
interface AlienOptions
{
  canvasId?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  
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
  
  levelOnErrorFunction?: (error: any) => void,
  levelOnLoadFunction?: () => void
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
  
  constructor(options: AlienOptions)
  {
    var options: AlienOptions = applyAGDefaultOptions(options);
    
    this.engine = new Engine();
    this.game = new AGGame(options);
    
    this.game.spriteManager.loadFromSpriteTable(spriteTable,
      function(left, total) {
        var element: HTMLElement;
        element = document.getElementById(options.progressBarId);
        
        if(!element)
          return;

        element.style.width = (total - left) / total * 100 + "%";        
    }).then(function() {
      var main = this.game;
      
      if(options.editMode) {
        this.editor = new Editor(this.game);
        var spriteBox = new SpriteBox(options.spriteBoxId, this.editor, spriteTable); 
        
        main = this.editor;
      }
      
      var height = options.canvasHeight + 64 * (options.editMode?1:0);
      
      this.engine.initializeEngine(options.canvasId, options.canvasWidth, height, main);
      this.engine.debugMode = options.debugMode;
      
      this.loader = new LevelLoader(options, this.game);
      
      this.loader.loadLevel(options.levelName).then(function(response) {
        this.game.reset();
        
        options.levelOnLoadFunction();
      }.bind(this), function(error) {
        options.levelOnErrorFunction(error);
      });
    }.bind(this));
  }
}