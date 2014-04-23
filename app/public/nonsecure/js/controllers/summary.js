'use strict';

/* Controllers */

app.controller('Summary', ['$scope', 'ledger',
function($scope, ledger) {
  
  var chart1 = {};
  chart1.type = "BarChart";
  //chart1.cssStyle = "height:200px; width:300px;";
  chart1.data = {
    "cols": [
      {
        id: "name",
        label: "Name",
        type: "string"
      },
      {
        id: "balance",
        label: "Balance",
        type: "number"
      }
    ],
    "rows": []
  };

  chart1.options = {
      "title": "Percentual balances",
      "fill": 20,
      "displayExactValues": true,
      "vAxis": {
          "title": "Person",
      },
      "hAxis": {
          "title": "Percentage of total value",
          "format": "#%"
      },
      "legend":"none"
  };

  chart1.formatters = {};

  $scope.chart = chart1;

  function updateView() {
    var l = $scope.ledger;
    return ledger.summary({
      ledger_id: l.ledger_id
    }).$promise.
    then(function(s) {
      s.total_value_currency = l.currencyMap(s.total_value_currency_id);
      s.user_balance_currency = l.currencyMap(s.user_balance_currency_id);
			s.user_credit_currency = l.currencyMap(s.user_credit_currency_id);
      l.summary = s;
      return ledger.balances({
        ledger_id: l.ledger_id
      }).$promise;
    }).then(function(b) {
      chart1.data.rows = [];
      b.forEach(function(bal) {
        chart1.data.rows.push({
          c: [
            {v: bal.name},
            {v: bal.rel_user_balance}
          ]
        });
        bal.currency = l.currencyMap(bal.currency_id);
      });
    l.balances = b;
    });
  }

	$scope.ledger.$promise.
	then(function() {
		updateView();
	});

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


}]);
