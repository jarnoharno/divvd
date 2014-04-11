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

var orm = shitorm({
  props: [
    'amount',
    'currency_id',
    'participant_id'
  ],
  pk: 'amount_id',
  table: 'amount',
  constructor: Amount
});

dao.create = orm.create;
dao.update = orm.update;
dao.delete = orm.delete;
dao.find = orm.find;
dao.find_by_participant_id = function(participant_id, db) {
  db = db || qdb;
  return orm.find_by('participant_id', participant_id, db);
};

dao.find_with_owners = function(amount_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return Promise.bind({}).
    then(function() {
      return dao.find(amount_id, db);
    }).
    then(function(amount) {
      this.amount = amount;
      return db.query('select user_id from owner natural join transaction natural join participant where participant_id = $1;',
          [amount.participant_id]);
    }).
    then(function(result) {
      this.owners = result.rows.map(function(row) {
        return row.user_id;
      });
      return this;
    });
  });
};
