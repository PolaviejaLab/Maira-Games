/** @module Alien **/
"use strict";

/**
 * Constructs a level loading class
 *
 * @class
 * @classdesc Level loading class
 */
class LevelLoader
{
  private game: AGGame;
  private Sprite_Player: number = 0x002;
  private Sprite_Enemy_Fly: number = 0x0A00;
  private Sprite_Enemy_Bee: number = 0x0A03;
  private Sprite_Enemy_Bat: number = 0x0A06;
  
  private options: AlienOptions;
  
  constructor(options: AlienOptions, game: AGGame)
  {
    this.options = options;
    this.game = game;
  }

  /**
   * Loads the level from the list and sets up the game
   * state (players / enemies) accordingly.
   *
   * @param {String} name - Name of the level to load
   */
  loadLevel(name: string): Promise<{}>
  {
    return new Promise(function(resolve, reject) {
      this.game.deleteAllObjects();
      console.log("-----");
      this.getLevelFromServer(name).then(
        /** 
         * Got level back from server
         */
        function(data) 
        {
          var level = new AGLevel(data.level);

          this.setLevelBounds(level);
          this.game.addObject('level', level);

          // Creating objects
          for(var i = 0; i < data.objects.length; i++) {
            var object = data.objects[i];

            if(!(object.type in constructors))
              throw new Error("Invalid type: " + object.type);

            var constructor = constructors[object.type];

            if(!constructor) {
              console.log("Skipping object: ", object);
              continue;
            }

            this.game.addObject(object.name, constructor(object));
          }

          resolve();
        }.bind(this),
        
        /**
         * Loading of the level failed
         */
        function(error) {
          console.log("LevelLoader.loadLevel failed: " + error);
          reject(error);
        }.bind(this));
      }.bind(this));
  };


  saveLevel(name: string)
  {
    var data = {
        'version': 2,
        'level': null,
        'objects': []
      };

    var names = this.game.getObjectNames();

    for(var i = 0; i < names.length; i++) {
      var object = this.game.getObject(names[i]);
      var array = object.toArray();

      if(names[i] == 'level') {
        data.level = array;
        continue;
      }

      array.name = names[i];
      data.objects.push( array );
    }

    return this.saveLevelToServer(name, data);
  };


  /**
   * Retrieves the level from the server
   *
   * @param {String} name - Name of the level to load
   */
  getLevelFromServer(name: string)
  {
  	return new Promise(function(resolve, reject) {
  		jQuery.ajax({
  			url: this.options.ldbAddress + "get_level.php?name=" + name,
  			dataType: 'json'
  		}).done(function(data) {
        if($.isArray(data))
          data = upgradeLevelVersion1(data);

  			resolve(data);
  		}).fail(function(response) {
        console.log("LevelLoader.getLevelFromServer() failed " + response);
  			reject(response.responseText);
  		});
  	}.bind(this));
  };


  /**
  * Save the level to the server
  *
  * @param {String} name - Name of the level to save
  */
  saveLevelToServer(name: string, level)
  {
  	return new Promise(function(resolve, reject) {
  		jQuery.ajax({
  			url: this.options.ldbAddress + "set_level.php?name=" + name,
  			data: JSON.stringify(level),
  			contentType: 'text/plain',
  			method: 'POST'
  		}).done(function(data) {
  			resolve();
  		}.bind(level)).fail(function(response) {
  			reject(response.responseText);
  		});
  	});
  };


  /**
   * Set level bounds on game object
   */
  setLevelBounds(level)
  {
    this.game.setLevelBounds({
      x: spriteSize,
      y: spriteSize,
      width: (level.getWidth() - 2) * spriteSize,
      height: (level.getHeight() - 2) * spriteSize
    });
  };
}


/**
 * Upgrade level from version 1 to version 2.
 *
 * @param {Array} data - Version 1 level returned from server
 * @returns {Array} Version 2 level
 */
function upgradeLevelVersion1(data)
{
  // Convert format
  data = {
    'version': 2,
    'level': data,
    'objects': [],
  };

  /**
   * Scans the level for special items, such as the player and enemies,
   * adds them to a list and removes them from the level.
   */
  var i_player = 1;
  var i_enemy = 1;

  for(var x = 0; x < data.level[0].length; x++) {
    for(var y = 0; y < data.level.length; y++) {

      // Extract location of player objects
      if(data.level[y][x] == 2) {
        data.objects.push({
          name: 'player_' + (i_player++),
          type: 'player',
          x: x * spriteSize,
          y: y * spriteSize - 12
        });

        data.level[y][x] = 0;
      }

      // Extract location of enemy objects
      if(isEnemy(data.level[y][x])) {
        data.objects.push({
          name: 'enemy_' + (i_enemy++),
          sprite: data.level[y][x],
          type: 'enemy',
          x: x * spriteSize, y: y * spriteSize,
          aggressionLevel: (data.level[y][x] == 0x0A03)?0:1
        });

        data.level[y][x] = 0;
      }
    }
  }

  // Add default player if none are found
  if(i_player == 1) {
    data.objects.push({
      name: 'player_1',
      type: 'player',
      x: spriteSize, y: 4 * spriteSize
    });
  }

  return data;
}
