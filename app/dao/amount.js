var shitorm   = require('../lib/shitorm');
var Amount    = require('../models/amount');
var dada      = require('../lib/dada');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'amount',
    'currency_id',
    'transaction_id',
    'person_id'
  ],
  pk: 'amount_id',
  table: 'amount',
  constructor: Amount
});

dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;

// transaction_id is a required parameter because where refers to it
dao.create = orm.create_with_defaults({
  currency_id: {
    table: {
      name: 'transaction',
      where: 'transaction_id'
    }
  },
  person_id: {
    table: {
      name: 'person',
      depends: {
        name: 'transaction',
        key: 'ledger_id'
      }
    }
  }
});

dao.find_by_transaction_id = orm.find_by.bind(undefined, 'transaction_id');

dao.owners = dada.array(function(amount_id, db) {
  return db.query(
      'select user_id from amount ' +
      'join transaction using (transaction_id) ' +
      'join owner using (ledger_id) where amount_id = $1;',
      [amount_id]);
});
