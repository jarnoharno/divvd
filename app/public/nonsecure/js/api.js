app.factory('ledger', ['$resource', function($resource) {
  return $resource('/api/ledgers/:ledger_id', {}, {
    all: {
      method: 'GET',
      url: '/api/ledgers',
      isArray: true
    },
    currencies: {
      method: 'GET',
      url: '/api/ledgers/:ledger_id/currencies',
      isArray: true
    }
  });
}]);
