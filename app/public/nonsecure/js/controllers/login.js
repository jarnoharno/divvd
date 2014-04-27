'use strict';

/* Controllers */

app.controller('LoginForm', ['$scope', '$state', 'auth',
    function($scope, $state, auth) {
  $scope.formuser = {
    username: '',
    password: ''
  };
  $scope.login = function() {
    auth.login($scope.formuser).
    then(function() {
      // success
      $state.go('member');
    }, function() {
      $scope.showAlert = true;
    });
  };
  $scope.signup = function() {
    auth.signup($scope.formuser).
    then(function() {
      // success
      $state.go('member');
    }, function(err) {
      $scope.showAlert = true;
      $scope.textAlert = err.data.message;
    });
  };
}]);
