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
      Account.get({ error: 'hidden' }).$promise.then(
        function(account) {
          console.log(account);
          // do not replace user reference
          // otherwise data binding won't work
          for (var key in account) {
            user[key] = account[key];
          }
        },
        function(err) {
          console.error('how do we get here?');
          console.error(err);
        });
    }
    // try to fetch account the first time the module is loaded
    console.log('fetching account information');
    fetchAccount();
    return {
      fetchAccount: fetchAccount,
      user: user
    };
  }]).
  factory('httpInterceptor', ['$q', '$location', function($q, $location) {
    return function(promise) {
      return promise.then(function(res) {
        console.log('success');
        // success
        return res;
      }, function(res) {
        // failure
        console.error('error');
        if (res.status == 401) {
          console.error('401');
          $location.path('/');
          return $q.resolve(res);
        }
        return $q.reject(res);
      });
    };
  }]);
