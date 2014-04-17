'use strict';

angular.module('divvd.controllers.collapse', []).
controller('Collapse', ['$scope', '$document', function($scope, $document) {
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
}]);
