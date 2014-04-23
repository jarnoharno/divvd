'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('divvd', [
  'ui.bootstrap',
  'ui.router',
  'ngResource',
	'xeditable',
  'divvd.services',
  'divvd.controllers',
  'googlechart'
  //'ngRoute',
  //'divvd.api',
  //'divvd.filters',
  //'divvd.services',
  //'divvd.directives',
  //'divvd.controllers'
]).
config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.
  state('guest', {
    url: '/',
    resolve: {
      'checkGuest': function(auth) {
        return auth.checkGuest('member');
      }
    },
    views: {
      'nav': {
        templateUrl: '/partials/guest_nav.html'
      },
      'body@': {
        templateUrl: '/partials/guest_body.html'
      }
    }
  }).
  state('guest.login', {
    url: 'login',
    views: {
      'body@': {
        templateUrl: '/partials/login.html'
      }
    }
  }).
  state('guest.signup', {
    url: 'signup',
    views: {
      'body@': {
        templateUrl: '/partials/signup.html'
      }
    }
  }).
  state('member', {
    url: '/',
    resolve: {
      'checkMember': function(auth) {
        return auth.checkMember('guest');
      }
    },
    views: {
      'nav': {
        templateUrl: '/partials/member_nav.html'
      },
      'body@': {
        templateUrl: '/partials/ledgers.html'
      }
    }
  }).
  state('member.ledgers', {
    url: 'ledgers'
  }).
  state('member.ledger', {
    url: 'ledgers/:ledger_id',
    resolve: {
      'currentLedger': function(ledger, $stateParams) {
        var led = ledger.get($stateParams);
        led.$promise.then(function(l) {
          l.currencyMap = function(currency_id) {
            for (var i = 0; i < led.currencies.length; ++i) {
              if (led.currencies[i].currency_id == currency_id) {
                return led.currencies[i];
              }
            }
          };
        });
        return led;
      }
    },
    views: {
      '@member': {
        templateUrl: '/partials/ledger_nav.html',
        controller: function($scope, currentLedger) {
          $scope.ledger = currentLedger;
        }
      },
      'body@': {
        templateUrl: '/partials/ledger.html',
        controller: function($scope, currentLedger) {
          $scope.ledger = currentLedger;
        }
      }
    }
  }).
  state('member.ledger.currencies', {
    url: '/currencies',
    views: {
      'body@': {
        templateUrl: '/partials/currencies.html',
        controller: function($scope, currentLedger) {
          $scope.ledger = currentLedger;
        }
      }
    }
  }).
  state('member.ledger.summary', {
    url: '/summary',
    views: {
      'body@': {
        templateUrl: '/partials/summary.html',
        controller: function($scope, currentLedger) {
          $scope.ledger = currentLedger;
        }
      }
    }
  }).
  state('member.ledger.transaction', {
    url: '/transactions/:transaction_id',
    views: {
      'body@': {
        templateUrl: '/partials/transaction.html',
        controller: function($scope, currentLedger) {
          $scope.ledger = currentLedger;
        }
      }
    }
  });
}]).
controller('MainCtrl', ['$scope', 'auth', '$state',
    function($scope, auth, $state) {
  $scope.logout = function() {
    auth.logout().
    then(function() {
      $state.go('guest');
    });
  }
}]);

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
}]);

app.run(function(editableOptions) {
	editableOptions.theme = 'bs3';
});

//run(['routeHandler', 'auth', function(logoutHandler, auth) {
  // force instantiation of routeHandler
  // authenticate as soon as possible
//}]);
