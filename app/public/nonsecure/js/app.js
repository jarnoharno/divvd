'use strict';


// Declare app level module which depends on filters, and services
angular.module('divvd', [
  'ngRoute',
  'divvd.filters',
  'divvd.services',
  'divvd.directives',
  'divvd.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/view1',
      {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'}).
    when('/view2',
      {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'}).
    otherwise({redirectTo: '/view1'});
}]).
config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
}]);
