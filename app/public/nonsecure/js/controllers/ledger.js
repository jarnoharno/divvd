'use strict';

/* Controllers */

app.controller('Ledger', ['$scope', 'ledger', '$q', 'auth',
    function($scope, ledger, $q, auth) {
  console.log($scope.ledger);
  $scope.user = auth.data.user;
  $scope.balancedClass = function(b) {
    if (b) {
      return 'text-success td-yes';
    } else {
      return 'text-danger td-no';
    }
  };
  $scope.delete = function(l) {
    ledger.delete({
      ledger_id: l.ledger_id
    }).$promise.
    then(updateView);
  };
  $scope.setBalanceCurrency = function(l, c) {
    ledger.update_owner({
      ledger_id: l.ledger_id,
      user_id: l.user_id
    }, {
      currency_id: c.currency_id 
    }).$promise.
    then(updateView);
  };
  $scope.setTotalCurrency = function(l, c) {
    ledger.update({
      ledger_id: l.ledger_id
    }, {
      total_currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };
  // construct ledgers for view
  function updateView() {
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
    });
  }
  updateView();
}]);
