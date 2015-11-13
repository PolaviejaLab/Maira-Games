
interface AlienOptions
{
  sinkAddress?: string;
  ldbAddress?: string;
  resourceAddress?: string;
}


function applyAGDefaultOptions(options: AlienOptions): AlienOptions
  {
    var defaults: AlienOptions = {
      //"canvasId": "game-canvas",
      //"canvasWidth": 1230,
      //"canvasHeight": 729.5,
      //"levelName": "example",
      
      "sinkAddress": "http://maira-server.champalimaud.pt/games/backend/sink.php",
      "ldbAddress": "http://maira-server.champalimaud.pt/games/backend/ldb/",
      "resourceAddress": "",
      
      //"gameStart": undefined,
      //"userId": undefined
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
