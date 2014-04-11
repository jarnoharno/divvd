var Currency = require('../models/currency');
var qdb = require('../lib/qdb');
var Hox = require('../lib/hox');
var util = require('./util');
var shitorm = require('../lib/shitorm');
var Promise = require('bluebird');

var dao = module.exports = {};

dao.find_by_ledger_id = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select code, rate, ledger_id, currency_id from currency where ledger_id = $1;',
      [ledger_id]).
  then(util.construct_set(Currency));
};

// return {
//  currency:Currency
//  owners:[user_id]
// }

dao.find_with_owners = function(currency_id, db) {
  db = db || qdb;
  return db.transaction(function(query) {
    db = { query: query };
    return Promise.bind({}).
    then(function() {
      return dao.find(currency_id, db);
    }).
    then(function(currency) {
      this.currency = currency;
    }).
    then(function() {
      return db.query('select user_id from owner where ledger_id = $1;',
          [this.currency.ledger_id]);
    }).
    then(function(result) {
      this.owners = result.rows.map(function(row) {
        return row.user_id;
      });
      return this;
    });
  });
};

// automatically generated stuff

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
dao.delete = orm.delete;
dao.update = orm.update;
dao.find = orm.find;
