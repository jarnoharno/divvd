'use strict';

angular.module('divvd.controllers.navbar', []).
controller('Navbar', ['$scope', 'auth', '$state', 
    function($scope, auth, $state) {
  $scope.logout = function() {
    auth.logout().
    then(function() {
      $state.go('guest');
    });
  }
}]);
