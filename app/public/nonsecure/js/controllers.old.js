'use strict';

/* Controllers */

angular.module('divvd.controllers', []).

controller('appState', ['$scope', 'auth', 'route', 'appState',
    function($scope, auth, route, appState) {
  $scope.u = auth.prop;
  $scope.r = route.prop;
  $scope.routeStarts = function(route) {
    return $scope.r.route.substring(0, route.length) === route;
  };
  $scope.logout = auth.logout;

  // current state

  $scope.d = appState.data;
}]).

controller('ledgers', function($scope) {
  $scope.delete = function() {
    console.log('delete (TODO)');
  }
  $scope.add = function() {
    console.log('add (TODO)');
  }
}).

controller('transaction', function ($scope) {
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.showWeeks = true;
  $scope.toggleWeeks = function () {
    $scope.showWeeks = ! $scope.showWeeks;
  };

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = ( $scope.minDate ) ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    'year-format': "'yy'",
    'starting-day': 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
  $scope.format = $scope.formats[0];

// timepicker

$scope.mytime = new Date();

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  $scope.changed = function () {
    console.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };
}).

controller('loginForm', ['$scope', '$location', 'auth',
    function($scope, $location, auth) {
  $scope.formuser = {
    username: '',
    password: ''
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
}]);
