/** @module Alien **/
"use strict";

/**
 * Constructs a level loading class
 *
 * @class
 * @classdesc Level loading class
 */
function LevelLoader(game)
{
  this.game = game;

  this.Sprite_Player = 0x0002;
  this.Sprite_Enemy_Fly = 0x0A00;
  this.Sprite_Enemy_Bee = 0x0A03;
  this.Sprite_Enemy_Bat = 0x0A06;

  /**
   * Loads the level from the list and sets up the game
   * state (players / enemies) accordingly.
   *
   * @param {String} name - Name of the level to load
   */
  this.loadLevel = function(name)
  {
    return new Promise(function(resolve, reject) {
      this.game.deleteAllObjects();
      this.getLevelFromServer(name).then(
        function(data) {
          var level = new Level(data.level);

          this.setLevelBounds(level);
          this.game.addObject('level', level);

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
        function(error) {
          console.log("LevelLoader.loadLevel failed: " + error);
          reject(error);
        });
      }.bind(this));
  };


  this.saveLevel = function(name)
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
  this.getLevelFromServer = function(name)
  {
  	return new Promise(function(resolve, reject) {
  		if(typeof(server) == 'undefined' || !server)
  			reject();

  		jQuery.ajax({
  			url: server + "ldb/get_level.php?name=" + name,
  			dataType: 'json'
  		}).done(function(data) {

        if($.isArray(data))
          data = upgradeLevelVersion1(data);

  			resolve(data);
  		}).fail(function(response) {
        console.log("LevelLoader.getLevelFromServer() failed " + response);
  			reject(response.responseText);
  		});
  	});
  };


  /**
  * Save the level to the server
  *
  * @param {String} name - Name of the level to save
  */
  this.saveLevelToServer = function(name, level)
  {
  	return new Promise(function(resolve, reject) {
  		if(typeof(server) == 'undefined' || !server)
  			reject();

  		jQuery.ajax({
  			url: server + "ldb/set_level.php?name=" + name,
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
  this.setLevelBounds = function(level)
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
