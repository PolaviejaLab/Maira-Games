
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
      { 'template': 'screens/maze/instructions1.html' },
      { 'template': 'screens/maze/practise.html', 'timeout': 2 },
      { 'template': 'screens/maze/instructions2.html' },
      { 'template': 'screens/maze/level_lobby.html' },
      { 'template': 'screens/maze/level.html', 'timeout': 15 * 60 },
      { 'template': 'screens/maze/final.html' }
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
      var participantId = $scope.data.participantId;

      if(participantId == "" || participantId === undefined)
        return false;

      var id = participantId.substr(participantId.length - 1);

      if(id <= "0" || id >= "9")
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


maze.controller('LobbyController', ['$scope',
  function($scope)
  {
    var lobby = new Lobby($scope.data.participantId, false);

    lobby.onStart = function()
    {
      $scope.$apply(function() {
        $scope.next();
      });
    }

    $scope.$on("$destroy", function() {
      lobby.destroy();
      delete lobby;
    });
  }
]);


maze.controller('MazeController', ['$scope',
  function($scope)
  {
    var options = {};
    var timerId = undefined;

    /**
     * Setup time-out
     */
    if('timeout' in $scope.screen)
    {
      var timeout = $scope.screen['timeout'];

      timerId = setInterval(function() {
        if(timeout == 0) {
          clearInterval(timerId);
          timerId = undefined;

          $scope.$apply(function() {
            $scope.next();
          });

        } else {
          timeout -= 1;
        }
      }, 1000);
    }

    /**
     * Set options
     */
    options.controlMode = "direction";
    options.userId = $scope.data.participantId;

    /**
     * Determine time of game start
     *  - First check "?gameStart#=..." with # the screenId
     *  - If the key does not exist, generate a new one and pushState
     */
    var key = "gameStart" + $scope.screenId;
    options.gameStart = getQueryField(key);

    if(options.gameStart === undefined) {
      options.gameStart = Math.floor(Date.now() / 1000);
      var update = {};
      update[key] = options.gameStart;

      var href = updateQueryString(update);
      window.history.pushState(null, null, href);
    }

    // Determine level
    switch($scope.screenId) {
      case 3:
        options.levelName = "example";
        break;
      case 5:
        options.levelName = "level" +
          options.userId.substr(options.userId.length - 1);
        break;
    }

	  var maze = new MazeGame(options);
  }
]);
