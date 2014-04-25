var Ledger = require('../models/ledger');
var currency = require('./currency');
var user = require('./user');
var person = require('./person');
var Hox = require('../lib/hox');
var Promise = require('bluebird');
var merge = require('../lib/merge');
var shitorm = require('../lib/shitorm');
var util = require('./util');
var extend = require('../lib/extend');
var qdb = require('../lib/qdb');
var Amount = require('../models/amount');

var dao = module.exports = {};

var dada = require('../lib/dada')(module);

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

dao.create = orm.create;
dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;
dao.find_by_transaction_id = function(participant_id, db) {
  db = db || qdb;
  return orm.find_by('transaction_id', participant_id, db);
};

dao.owners = dada.array(function(amount_id, db) {
  return db.query(
      'select user_id from amount ' +
      'join transaction using (transaction_id)' +
      'join owner using (ledger_id) where amount_id = $1;',
      [amount_id]);
});

dao.find_with_owners = function(amount_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return Promise.bind({}).
    then(function() {
      return dao.find(amount_id, db);
    }).
    then(function(amount) {
      this.amount = amount;
      return db.query('select user_id from owner join transaction using (ledger_id) where transaction_id = $1;',
          [amount.transaction_id]);
    }).
    then(function(result) {
      this.owners = result.rows.map(function(row) {
        return row.user_id;
      });
      return this;
    });
  });
};
