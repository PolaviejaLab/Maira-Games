

interface MazeOptions
{
  gameStart: number;
  userId: string;
  
  canvasId?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  
  levelName?: string;
  controlMode?: string;
  
  // Server to send data to
  sinkAddress?: string;
  
  // Server to load levels from
  ldbAddress?: string;
  
  // Resource server
  resourceAddress?: string;
}


function applyDefaultOptions(options: MazeOptions): MazeOptions
  {
    var defaults: MazeOptions = {
      "canvasId": "game-canvas",
      "canvasWidth": 1230,
      "canvasHeight": 729.5,
      "levelName": "example",
      "controlMode": "control",
      
      "sinkAddress": "http://maira-server.champalimaud.pt/games/backend/sink.php",
      "ldbAddress": "http://maira-server.champalimaud.pt/games/backend/mldb/",
      "resourceAddress": "",
      
      "gameStart": undefined,
      "userId": undefined
    };
    
    for(var key in defaults) {
      if(!(key in options))
        options[key] = defaults[key];
    }
    
    return options;
  }


class MazeGame
{
  private options: MazeOptions;
  
  private engine: Engine;
  private game: MGGame;
  private level: MGLevel;
  
  
  constructor(options: MazeOptions)
  {
    options = applyDefaultOptions(options);
    
    //console.log("Starting maze game with options:", options);
    
    this.engine = new Engine();
    this.game = new MGGame(options);
    
    this.engine.initializeEngine(
       options.canvasId, options.canvasWidth, options.canvasHeight, this.game);
    
    this.level = new MGLevel(options);
    this.game.addObject("level", this.level);
    this.game.addObject("player", new MGPlayer(options));
    this.game.addObject("controls", new Controls());
  }
}  
  
  


/**
 * Loads the list of levels into a form element.
 * @param {String} element <select> Element to insert levelnames into.
 * @param {String} selected Selected item.
 */
function updateLevelSelector(options: MazeOptions, element, selected)
{
  var options: MazeOptions = applyDefaultOptions(options);
  
  jQuery.ajax(options.ldbAddress + "list_levels.php", { dataType: 'json'}).done(function(result) {
    for(var i = 0; i < result.length; i++) {
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
