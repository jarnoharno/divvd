'use strict';

/* Controllers */

angular.module('divvd.controllers', []).
controller('front', ['$scope', 'auth', function($scope, auth) {
  $scope.user = auth.user;
}]).
controller('login', [function() {
}]).
controller('signup', [function() {
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
  $scope.user = auth.user;
  if ($scope.user.role === 'guest') {
    $scope.routes = [
      { path: '/login', name: 'Login' },
      { path: '/signup', name: 'Signup' }
    ];
  } else {
    $scope.routes = [
      { path: '/', name: 'Home' }
    ];
  }
  $scope.active = function(path) {
    return $location.path() === path;
  };
}]);
