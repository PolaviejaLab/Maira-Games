
var lobbyApp = angular.module('Lobby', []);

lobbyApp.controller('LobbyController', ['$scope',
  function($scope)
  {
    $scope.clients = {};
    $scope.to_start = {};

    var lobby = new Lobby("lobby", true);

    lobby.onUpdateClients = function(clients)
    {
      $scope.$apply(function() {
        $scope.clients = clients;
      });
    }


    $scope.startGames = function()
    {
      var list = [];

      for(var key in $scope.to_start) {
        if($scope.to_start[key])
          list.push(key);
      }

      console.log(list);

      lobby.startClients(list);
    }

  }
]);
