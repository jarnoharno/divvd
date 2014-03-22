'use strict';


// Declare app level module which depends on filters, and services
angular.module('divvd', [
  'ui.bootstrap',
  'ngRoute',
  'ngResource',
  'divvd.filters',
  'divvd.services',
  'divvd.directives',
  'divvd.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/',
      { templateUrl: 'partials/front.html', controller: 'front'} ).
    when('/signup',
      { templateUrl: 'partials/signup.html', controller: 'signup' }).
    when('/login',
      { templateUrl: 'partials/login.html', controller: 'login' }).
    otherwise({redirectTo: '/'});
}]).
config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
}])/*.
config(['$httpProvider',
    function($httpProvider) {
  $httpProvider.responseInterceptors.push('httpInterceptor');
}])*/;
