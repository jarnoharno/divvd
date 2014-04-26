var shitorm   = require('../lib/shitorm');
var Currency  = require('../models/currency');
var dada      = require('../lib/dada');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'code',
    'rate',
    'ledger_id'
  ],
  pk: 'currency_id',
  table: 'currency',
  constructor: Currency
});

dao.create = orm.create;
dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;

dao.find_by_ledger_id = orm.find_by.bind(undefined, 'ledger_id');

dao.owners = dada.array(function(currency_id, db) {
  return db.query(
      'select user_id from currency ' +
      'join owner using (ledger_id) where currency.currency_id = $1;',
      [currency_id]);
});
