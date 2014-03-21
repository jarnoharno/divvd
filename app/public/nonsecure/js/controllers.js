'use strict';

/* Controllers */

angular.module('divvd.controllers', []).
controller('front', ['$scope', 'auth', function($scope, auth) {
  $scope.user = auth.user;
}]).
controller('login', [function() {
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
  if ($scope.user === 'user') {
    $scope.routes = [
      { path: '/', name: 'Home' }
    ];
  } else {
    $scope.routes = [
      { path: '/register', name: 'Register' },
      { path: '/login', name: 'Login' }
    ];
  }
  $scope.active = function(path) {
    return $location.path() === path;
  };
}]);
