'use strict';

/* Services */

angular.module('divvd.services', []).
  factory('auth', ['$resource', function($resource) {
    // default user
    var user = {
      username: 'guest',
      role: 'guest',
      user_id: 0
    };
    var Account = $resource('/api/account');
    function fetchAccount() {
      Account.get({ auth: 'hidden' }).$promise.then(
        function(account) {
          // do not replace user reference
          // otherwise data binding won't work
          for (var key in account) {
            user[key] = account[key];
          }
        });
    }
    // try to fetch account the first time the module is loaded
    fetchAccount();
    return {
      fetchAccount: fetchAccount,
      user: user
    };
  }]);
