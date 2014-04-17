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
config(['$routeProvider', function($routeProvider) {
  // abusing 'controllerAs' parameter to provide
  // route name for routeMap service
  function route(name) {
    $routeProvider.when(name, { controllerAs: name });
  }
  route('/');
  route('/signup');
  route('/login');
  route('/logout');
  route('/ledgers');
  route('/ledgers/:ledgerId');
  route('/ledgers/:ledgerId/summary');
  route('/ledgers/:ledgerId/currencies');
  route('/ledgers/:ledgerId/transactions/:transactionId');
  $routeProvider.otherwise({ redirectTo: '/' });
}]).
config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
}]).
run(['routeHandler', 'auth', function(logoutHandler, auth) {
  // force instantiation of routeHandler
  // authenticate as soon as possible
}]);
