'use strict';

/* Controllers */

app.controller('Transaction',
    ['$scope', 'ledger', '$q', 'auth', 'transaction', '$stateParams',
    function($scope, ledger, $q, auth, transaction, $stateParams) {
  
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.showWeeks = true;
  $scope.toggleWeeks = function () {
    $scope.showWeeks = ! $scope.showWeeks;
  };

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = ( $scope.minDate ) ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    'year-format': "'yy'",
    'starting-day': 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
  $scope.format = $scope.formats[0];

// timepicker

  $scope.mytime = new Date();

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = false;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  $scope.changed = function () {
    console.log('Time changed to: ' + $scope.mytime);
  };

  $scope.clear = function() {
    $scope.mytime = null;
  };

  $scope.user = auth.data.user;

	function updateView() {
		var l = $scope.ledger;
    transaction.get($stateParams).$promise.
    then(function(t) {
      t.date = new Date(t.date);
      console.log(typeof t.date);
      t.currency = l.currencyMap(t.currency_id);
      $scope.transaction = t;
		});
	}

	$scope.ledger.$promise.
	then(function() {
		updateView();
	});

  $scope.delete = function(t) {
		transaction.delete({
			transaction_id: t.transaction_id
		}).$promise.
		then(updateView);
  };

	$scope.setTitle = function(title) {
		var l = $scope.ledger;
		return ledger.update({
			ledger_id: l.ledger_id
		}, {
			title: title
		}).$promise.
		then(updateView);
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

  $scope.setSumBalanceCurrency = function(c) {
		var s = $scope.ledger.summary;
    ledger.update_owner({
      ledger_id: s.ledger_id,
      user_id: s.user_id
    }, {
			currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };
  $scope.setSumTotalCurrency = function(c) {
		var s = $scope.ledger.summary
    ledger.update({
      ledger_id: s.ledger_id
    }, {
      total_currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };
	$scope.setSumCreditCurrency = function(c) {
		var s = $scope.ledger.summary;
    ledger.update_owner({
      ledger_id: s.ledger_id,
      user_id: s.user_id
    }, {
			total_credit_currency_id: c.currency_id
    }).$promise.
    then(updateView);
	};
}]);
