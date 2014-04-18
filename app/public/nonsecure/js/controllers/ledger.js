'use strict';

/* Controllers */

app.controller('Ledger', ['$scope', 'ledger', '$q', 'auth', 'transaction',
    function($scope, ledger, $q, auth, transaction) {

  $scope.user = auth.data.user;

	function updateView() {
		var l = $scope.ledger;
		ledger.summary({
			ledger_id: l.ledger_id
		}).$promise.
		then(function(ts) {
			ts.forEach(function(t) {
				t.total_value_currency = l.currencyMap[t.total_value_currency_id];
				t.user_balance_currency = l.currencyMap[t.user_balance_currency_id];
				t.user_credit_currency = l.currencyMap[t.user_credit_currency_id];
			});
			$scope.ledger.transactions = ts;
		});
	}

	$scope.ledger.$promise.
	then(function() {
		updateView();
	});

  $scope.delete = function(t) {
  };
  $scope.setBalanceCurrency = function(t, c) {
		transaction.update_summary({
			transaction_id: t.transaction_id
		}, {
			owner_balance_currency_id: c.currency_id
		}).$promise.
		then(updateView);
  };
  $scope.setTotalCurrency = function(t, c) {
		transaction.update_summary({
			transaction_id: t.transaction_id
		}, {
			total_value_currency_id: c.currency_id
		}).$promise.
		then(updateView);
  };
	$scope.setCreditCurrency = function(t, c) {
		transaction.update_summary({
			transaction_id: t.transaction_id
		}, {
			owner_total_credit_currency_id: c.currency_id
		}).$promise.
		then(updateView);
	};
}]);
