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
var Currency = require('../models/currency');
var close = require('../lib/close');
var dada = require('../lib/dada');

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

dao.find_by_ledger_id = function(ledger_id, db) {
  return orm.find_by('ledger_id', ledger_id, db);
};

dao.owners = dada.array(function(currency_id, db) {
  return db.query(
      'select user_id from currency ' +
      'join owner using (ledger_id) where currency_id = $1;',
      [currency_id]);
});
