'use strict';

/* Controllers */

angular.module('divvd.controllers.ledgers', []).
controller('Ledgers', ['$scope', 'ledger', '$q', 'auth',
    function($scope, ledger, $q, auth) {
  $scope.user = auth.data.user;
  $scope.balancedClass = function(b) {
    if (b) {
      return 'text-success td-yes';
    } else {
      return 'text-danger td-no';
    }
  };
  // construct ledgers for view
  ledger.ledgers_summary().$promise.
  then(function(ls) {
    return $q.all(ls.map(function(l) {
      // monkey patch currency map
      l.currency_map = {};
      return ledger.currencies({ledger_id: l.ledger_id}).$promise.
      then(function(cs) {
        l.currencies = cs;
        cs.forEach(function(c) {
          l.currency_map[c.currency_id] = c;
        });
        l.total_value_currency = l.currency_map[l.total_value_currency_id];
        l.user_balance_currency = l.currency_map[l.user_balance_currency_id];
        return l;
      });
    }));
  }).
  then(function(ls) {
    $scope.ledgers = ls;
    console.log(ls);
  });
}]);
