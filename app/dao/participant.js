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
var Participant = require('../models/participant');
var amount = require('./amount');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'share_debt',
    'credit_currency_id',
    'debit_currency_id',
    'shared_debt_currency_id',
    'transaction_id',
    'person_id',
  ],
  pk: 'participant_id',
  table: 'participant',
  constructor: Participant
});

dao.create = orm.create;
dao.update = orm.update;
dao.delete = orm.delete;
dao.find_by_transaction_id = function(transaction_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return orm.find_by('transaction_id', transaction_id, db).
    then(function(participants) {
      return Promise.all(participants.map(fetch_amounts(db)));
    });
  });
};

dao.find = function(participant_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return orm.find(participant_id, db).
    then(fetch_amounts(db));
  });
};

function fetch_amounts(db) {
  return function(participant) {
    return amount.find_by_participant_id(participant.participant_id, db).
    then(function(amounts) {
      participant.amounts = amounts;
      return participant;
    });
  }
}

dao.find_with_owners = function(participant_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return Promise.bind({}).
    then(function() {
      return dao.find(participant_id, db);
    }).
    then(function(participant) {
      this.participant = participant;
      return db.query('select user_id from owner natural join transaction where transaction_id = $1;',
          [participant.transaction_id]);
    }).
    then(function(result) {
      this.owners = result.rows.map(function(row) {
        return row.user_id;
      });
      return this;
    });
  });
};
