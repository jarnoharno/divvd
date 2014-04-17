'use strict';

// Declare app level module which depends on filters, and services
angular.module('divvd', [
  'ui.bootstrap',
  'ui.router',
  'ngRoute',
  'ngResource',
  'divvd.api',
  'divvd.filters',
  'divvd.services',
  'divvd.directives',
  'divvd.controllers'
]).
config(['$stateProvider', function($stateProvider) {
  $stateProvider
  .state('index', {
    url: "",
    views: {
      "nav": {
        templateUrl: "nav.html"
      },
      "body": {
        templateUrl: "body.html"
      }
    }
  });
}]).
config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
}]).
run(['routeHandler', 'auth', function(logoutHandler, auth) {
  // force instantiation of routeHandler
  // authenticate as soon as possible
}]);
