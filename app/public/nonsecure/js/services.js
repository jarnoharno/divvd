'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('divvd.services', []).
  value('version', '0.1').
  factory('auth', [function() {
    return {
      role: 'user',
      username: 'test'
    };
  }]);
