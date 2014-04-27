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

dao.find_by_ledger_id = dada.array(function(ledger_id, db) {
  return db.query(
      'select * from currency_active ' +
      'where ledger_id = $1 order by currency_id;',
      [ledger_id]);
}, Currency);

dao.owners = dada.array(function(currency_id, db) {
  return db.query(
      'select user_id from currency ' +
      'join owner using (ledger_id) where currency.currency_id = $1;',
      [currency_id]);
});
