'use strict';

/* Controllers */

app.controller('Summary', ['$scope', 'ledger',
function($scope, ledger) {
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

  $scope.chart = {
    "type": "ColumnChart",
    "cssStyle": "height:200px; width:300px;",
    "data": {
      "cols": [
        {
          "id": "month",
          "label": "Month",
          "type": "string",
          "p": {}
        },
        {
          "id": "laptop-id",
          "label": "Laptop",
          "type": "number",
          "p": {}
        },
        {
          "id": "desktop-id",
          "label": "Desktop",
          "type": "number",
          "p": {}
        },
        {
          "id": "server-id",
          "label": "Server",
          "type": "number",
          "p": {}
        },
        {
          "id": "cost-id",
          "label": "Shipping",
          "type": "number"
        }
      ],
      "rows": [
        {
          "c": [
            {
              "v": "January"
            },
            {
              "v": 19,
              "f": "42 items"
            },
            {
              "v": 12,
              "f": "Ony 12 items"
            },
            {
              "v": 7,
              "f": "7 servers"
            },
            {
              "v": 4
            }
          ]
        },
        {
          "c": [
            {
              "v": "February"
            },
            {
              "v": 13
            },
            {
              "v": 1,
              "f": "1 unit (Out of stock this month)"
            },
            {
              "v": 12
            },
            {
              "v": 2
            }
          ]
        },
        {
          "c": [
            {
              "v": "March"
            },
            {
              "v": 24
            },
            {
              "v": 0
            },
            {
              "v": 11
            },
            {
              "v": 6
            }
          ]
        }
      ]
    },
    "options": {
      "title": "Sales per month",
      "isStacked": "true",
      "fill": 20,
      "displayExactValues": true,
      "vAxis": {
        "title": "Sales unit",
        "gridlines": {
          "count": 6
        }
      },
      "hAxis": {
        "title": "Date"
      }
    },
    "formatters": {},
    "displayed": true
  };
}]);
