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
var close = require('../lib/close');
var dada = require('../lib/dada')(module);

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

dao.create = orm.create;
dao.update = close(orm.update);
dao.delete = close(orm.delete);
dao.find = close(orm.find);

dao.find_by_transaction_id = function(participant_id, db) {
  return orm.find_by('transaction_id', participant_id, db);
};

dao.owners = close(dada.array(function(amount_id, db) {
  return db.query(
      'select user_id from amount ' +
      'join transaction using (transaction_id)' +
      'join owner using (ledger_id) where amount_id = $1;',
      [amount_id]);
}));
