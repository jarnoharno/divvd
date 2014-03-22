'use strict';

/* Controllers */

angular.module('divvd.controllers', []).

controller('loginStatus', ['$scope', 'auth', function($scope, auth) {
  $scope.auth = auth.prop;
}]).

controller('loginForm', ['$scope', '$location', 'auth',
    function($scope, $location, auth) {
  $scope.formuser = {
    name: '',
    pass: ''
  };
  $scope.login = function() {
    auth.login($scope.formuser).
    then(function() {
      // success
      $location.path('/');
    }, function() {
      $scope.showAlert = true;
    });
  };
  $scope.signup = function() {
    auth.signup($scope.formuser).
    then(function() {
      // success
      $location.path('/');
    }, function(err) {
      $scope.showAlert = true;
      $scope.textAlert = err.data.message;
    });
  };
}]).

controller('collapse', ['$scope', '$document',
    function($scope, $document) {
  $scope.isCollapsed = true;
  // ClickStatus indicates whether menu should be collapsed.
  // If the click event reaches document click handler with clickStatus unset
  // (null), menu will be collapsed.
  $scope.clickStatus = null;
  $scope.collapse = function(arg) {
    if ($scope.clickStatus === null) {
      $scope.clickStatus = arg;
    }
  };
  $document.bind('click', function() {
    if ($scope.clickStatus === null) {
      $scope.isCollapsed = true;
    } else {
      $scope.isCollapsed = $scope.clickStatus;
    }
    $scope.clickStatus = null;
    $scope.$digest();
  });
}]).

controller('navbar', ['$scope', '$location', 'auth',
    function($scope, $location, auth) {
  $scope.user = auth.prop.user;
  $scope.logout = auth.logout;
}]);
