
var maze = angular.module('maze', []);

maze.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);

/**
 * Controller that manages the screen flow in the
 * maze-game.
 */
maze.controller('FlowController', ['$scope',
  function($scope)
  {
    $scope.screens = [
      { 'template': 'screens/maze/identifier.html' },
      { 'template': 'screens/maze/instructions.html' },
      { 'template': 'screens/maze/practise.html' },
      { 'template': 'screens/maze/level.html' }
    ];

    // Load fields from query field
    $scope.screenId = parseInt(getQueryField("screenId"));
    $scope.data = {
      participantId: getQueryField("participantId"),
      fullScreen: false
    };

    // Load selected screen
    if(!$scope.screenId > 0)
      $scope.screenId = 0;
    $scope.screen = $scope.screens[$scope.screenId];


    $scope.make_fullscreen = function()
    {
      var elem = document.getElementById("fullscreen");

      requestFullscreen(elem).then(function() {
        $scope.$apply(function() {
          $scope.data.fullScreen = true;
        });

      }, function(message) {
        $scope.$apply(function() {
          $scope.data.fullScreen = false;
        });
      });
    }


    /**
     * Determine if the advancing to the next screen is allowed
     */
    $scope.is_next_allowed = function()
    {
      if($scope.data.participantId == '')
        return false;

      return true;
    }


    /**
     * Advance to next screen
     */
    $scope.next = function()
    {
      // Only advance if allowed
      if(!$scope.is_next_allowed())
        return;

      // Go to next screen
      $scope.screenId++;
      $scope.screen = $scope.screens[$scope.screenId];

      // Update URL
      var href = updateQueryString({
        "screenId": $scope.screenId,
        "participantId": $scope.data.participantId
      });

      window.history.pushState(null,
        "Experiment Platform Screen " + $scope.screenId, href);
    }
  }
]);


maze.controller('MazeController', ['$scope',
  function($scope)
  {
    var canvas_id = "game-canvas";
    var engine = new Engine();
    var game = new Game();

    engine.initializeEngine(canvas_id, 1230, 729.5, game);

    var gameStart = 0;

    var canvas = document.getElementById(canvas_id);

    // Determine level
    switch($scope.screenId) {
      case 2: levelName = "example"; break;
      case 3: levelName = "level1"; break;
    }

    /**
     * Determine time of game start
     *  - First check "?gameStart#=..." with # the screenId
     *  - If the key does not exist, generate a new one and pushState
     */
    var key = "gameStart" + $scope.screenId;
    var gameStart = getQueryField(key);

    if(gameStart === undefined) {
      gameStart = Math.floor(Date.now() / 1000);
      var update = {};
      update[key] = gameStart;

      var href = updateQueryString(update);
      window.history.pushState(null, null, href);
    }

    /**
     * Start game
     */
    var options = {
      gameStart: gameStart,
      levelName: levelName,
      userId: $scope.data.participantId,
      controlMode: "direction"
    };

    var level = new Level(levelName);
    game.addObject("level", level);
    game.addObject("player", new Player(options));
    game.addObject("controls", new Controls());
  }
]);
