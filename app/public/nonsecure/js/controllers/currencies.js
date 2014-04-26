'use strict';

/* Controllers */

app.controller('Currencies.add', ['$scope', '$modalInstance',
function($scope, $modalInstance) {
  $scope.currency = {
    code: '€',
    rate: 1.0
  };
  $scope.ok = function () {
    $modalInstance.close($scope.currency);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss();
  };
}]);

app.controller('Currencies', ['$scope', 'ledger', 'currency', '$modal',
function($scope, ledger, currency, $modal) {

  var l = $scope.ledger;

  function updateView() {
    ledger.currencies({
      ledger_id: l.ledger_id
    }).$promise.
    then(function(cs) {
      l.currencies = cs;
    });
  }

  $scope.add = function(c) {
    $modal.open({
      templateUrl: 'currencies_add.html',
      controller: 'Currencies.add'
    }).result.
    then(function(c) {
      return ledger.create_currency({
        ledger_id: l.ledger_id
      }, {
        code: c.code,
        rate: Number(c.rate)
      }).$promise;
    }).
    then(function(c) {
      updateView();
    });
  };
  $scope.delete = function(c) {
    return currency.delete({
      currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };
  $scope.setCode = function(c, code) {
    currency.update({
      currency_id: c.currency_id
    }, {
      code: code
    }).$promise.
    then(function(c) {
      updateView();
    });
  };
  $scope.setRate = function(c, rate) {
    currency.update({
      currency_id: c.currency_id
    }, {
      rate: rate
    }).$promise.
    then(function(c) {
      updateView();
    });
  };
  $scope.ledger.$promise.
  then(function() {
    updateView();
  });
}]);
