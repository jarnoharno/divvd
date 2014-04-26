'use strict';

// Source: http://stackoverflow.com/questions/497790
var dates = {
  convert:function(d) {
    // Converts the date in d to a date-object. The input can be:
    //  a date object: returned without modification
    // an array   : Interpreted as [year,month,day]. NOTE: month is 0-11.
    //  a number   : Interpreted as number of milliseconds
    //         since 1 Jan 1970 (a timestamp) 
    //  a string   : Any format supported by the javascript engine, like
    //         "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
    // an object   : Interpreted as an object with year, month and date
    //         attributes. **NOTE** month is 0-11.
    return (
      d.constructor === Date ? d :
      d.constructor === Array ? new Date(d[0],d[1],d[2]) :
      d.constructor === Number ? new Date(d) :
      d.constructor === String ? new Date(d) :
      typeof d === "object" ? new Date(d.year,d.month,d.date) :
      NaN
    );
  },
  compare:function(a,b) {
    // Compare two dates (could be of any type supported by the convert
    // function above) and returns:
    // -1 : if a < b
    //  0 : if a = b
    //  1 : if a > b
    // NaN : if a or b is an illegal date
    // NOTE: The code inside isFinite does an assignment (=).
    return (
      isFinite(a=this.convert(a).valueOf()) &&
      isFinite(b=this.convert(b).valueOf()) ?
      (a>b)-(a<b) :
      NaN
    );
  },
  inRange:function(d,start,end) {
    // Checks if date in d is between dates in start and end.
    // Returns a boolean or NaN:
    //  true : if d is between start and end (inclusive)
    //  false : if d is before start or after end
    //  NaN  : if one or more of the dates is illegal.
    // NOTE: The code inside isFinite does an assignment (=).
    return (
      isFinite(d=this.convert(d).valueOf()) &&
      isFinite(start=this.convert(start).valueOf()) &&
      isFinite(end=this.convert(end).valueOf()) ?
      start <= d && d <= end :
      NaN
    );
  }
}

/* Controllers */

app.controller('Transaction',
    ['$scope', 'ledger', '$q', 'auth', 'transaction', '$stateParams', 'amount',
    'participant',
    function($scope, ledger, $q, auth, transaction, $stateParams, amount,
      participant) {
  
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
    transaction.get({
      transaction_id: $stateParams.transaction_id
    }).$promise.
    then(function(t) {
      t.date = new Date(t.date);
      // currencies and persons
      t.currency = l.currencyMap(t.currency_id);
      t.amounts.forEach(function(a) {
        a.person = l.personMap(a.person_id);
        a.currency = l.currencyMap(a.currency_id);
      });
      t.participants.forEach(function(p) {
        p.person = l.personMap(p.person_id);
        p.currency = l.currencyMap(p.currency_id);
      });
      $scope.transaction = t;
    });
  }

  function t_update(obj) {
    return transaction.update({
      transaction_id: $scope.transaction.transaction_id
    }, obj).$promise;
  }

  // abusing comparator
  function comp(newVal, oldVal) {
    return oldVal === undefined || newVal === oldVal;
  }

  $scope.$watch('transaction.date', function(newValue, oldValue) {
    if (oldValue === undefined || dates.compare(newValue, oldValue) == 0) {
      return;
    }
    t_update({
      date: $scope.transaction.date
    }).
    then(updateView);
  });

  $scope.$watch('transaction.transfer', function(newVal, oldVal) {
    if (oldVal === undefined) {
      return;
    }
    t_update({
      transfer: $scope.transaction.transfer
    })
  });

  $scope.ledger.$promise.
  then(function() {
    updateView();
  });

  $scope.setDesc = function(desc) {
    transaction.update({
      transaction_id: $scope.transaction.transaction_id
    }, {
      description: desc
    }).$promise.
    then(updateView);
  };

  $scope.setAmountCurrency = function(a, c) {
    amount.update({
      amount_id: a.amount_id
    }, {
      currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };

  $scope.setParticipantCurrency = function(p, c) {
    participant.update({
      participant_id: p.participant_id
    }, {
      currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };

  $scope.setAmount = function(a, d) {
    var n = Number(d);
    if (isNaN(n)) {
      return 'NaN';
    }
    amount.update({
      amount_id: a.amount_id
    }, {
      amount: n
    }).$promise.
    then(updateView);
  };

  $scope.nonParticipants = function() {
    if (!$scope.ledger || !$scope.transaction) {
      return null;
    }
    var parts = $scope.transaction.participants;
    return $scope.ledger.persons.filter(function(p) {
      for (var i = 0; i < parts.length; ++i) {
        if (p.person_id == parts[i].person_id) {
          return false;
        }
      }
      return true;
    });
  };

  $scope.addParticipant = function(p) {
    transaction.add_participant({
      transaction_id: $scope.transaction.transaction_id
    }, {
      person_id: p.person_id,
      currency_id: $scope.transaction.currency_id
    }).$promise.
    then(updateView);
  };

  $scope.deleteParticipant = function(p) {
    participant.delete({
      participant_id: p.participant_id
    }).$promise.
    then(updateView);
  };

  $scope.deleteAmount = function(a) {
    amount.delete({
      amount_id: a.amount_id
    }).$promise.
    then(updateView);
  };

  $scope.addAmount = function(p) {
    transaction.add_amount({
      transaction_id: $scope.transaction.transaction_id
    }, {
      person_id: p.person_id,
      amount: 0,
      currency_id: $scope.transaction.currency_id
    }).$promise.
    then(updateView);
  };

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
  $scope.setTotalCurrency = function(t, c) {
    transaction.update({
      transaction_id: t.transaction_id
    }, {
      currency_id: c.currency_id
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
