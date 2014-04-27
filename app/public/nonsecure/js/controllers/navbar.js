'use strict';

app.controller('Navbar', ['$scope', 'auth', '$state', 
    function($scope, auth, $state) {
  $scope.logout = function() {
    auth.logout().
    then(function() {
      $state.go('guest');
    });
  }
}]);
