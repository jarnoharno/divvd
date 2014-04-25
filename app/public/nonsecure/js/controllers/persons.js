'use strict';

/* Controllers */

app.controller('Persons', ['$scope', 'ledger', 'currency', '$modal', 'person',
function($scope, ledger, currency, $modal, person) {

  var l = $scope.ledger;

  function updateView() {
    ledger.persons({
      ledger_id: l.ledger_id
    }).$promise.
    then(function(p) {
      l.persons = p;
    });
  }

  $scope.add = function(c) {
    ledger.add_person({
      ledger_id: $scope.ledger.ledger_id
    }, {
      "name": "New person"
    }).$promise.
    then(updateView);
  };
  $scope.setName = function(p, n) {
    person.update({
      person_id: p.person_id
    }, {
      name: n
    }).$promise.
    then(updateView);
  };
  $scope.delete = function(p) {
    return person.delete({
      person_id: p.person_id
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
  updateView();
}]);
