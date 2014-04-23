app.factory('ledger', ['$resource', function($resource) {
  return $resource('/api/ledgers/:ledger_id', {}, {
    create: {
      method: 'POST',
      url: '/api/ledgers'
    },
    ledgers_summary: {
      method: 'GET',
      url: '/api/ledgers/summary',
      isArray: true
    },
		summary: {
			method: 'GET',
			url: '/api/ledgers/:ledger_id/summary'
		},
		transactions_summary: {
			method: 'GET',
			url: '/api/ledgers/:ledger_id/transactions/summary',
			isArray: true
		},
    all: {
      method: 'GET',
      url: '/api/ledgers',
      isArray: true
    },
    currencies: {
      method: 'GET',
      url: '/api/ledgers/:ledger_id/currencies',
      isArray: true
    },
    update: {
      method: 'PUT',
      url: '/api/ledgers/:ledger_id'
    },
    update_owner: {
      method: 'PUT',
      url: '/api/ledgers/:ledger_id/owners/:user_id'
    },
    currencies: {
      method: 'GET',
      url: '/api/ledgers/:ledger_id/currencies',
      isArray: true
    },
    create_currency: {
      method: 'POST',
      url: '/api/ledgers/:ledger_id/currencies'
    },
    balances: {
      method: 'GET',
      url: '/api/ledgers/:ledger_id/balances',
      isArray: true
    }
  });
}]);

app.factory('transaction', ['$resource', function($resource) {
	return $resource('/api/transactions/:transaction_id', {}, {
		update_summary: {
			method: 'PUT',
			url: '/api/transactions/:transaction_id/summary'
		}
	});
}]);

app.factory('currency', ['$resource', function($resource) {
  return $resource('/api/currencies/:currency_id', {}, {
    update: {
      method: 'PUT'
    }
  });
}]);

app.factory('person', ['$resource', function($resource) {
  return $resource('/api/persons/:person_id', {}, {
    update: {
      method: 'PUT'
    }
  });
}]);
