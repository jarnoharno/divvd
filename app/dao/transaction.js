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
var Transaction = require('../models/transaction');
var participant = require('./participant');

var dao = module.exports = {};

var orm = shitorm({
  props: [
    'description',
    'date',
    'type',
    'location',
    'transfer',
    'currency_id',
    'ledger_id'
  ],
  pk: 'transaction_id',
  table: 'transaction',
  constructor: Transaction
});

dao.create = function(props, db) {
  db = db || qdb;
  var currency_id = props.currency_id || null;
  return db.transaction(function(db) {
    return orm.create(props, db).
    then(function(transaction) {

      // create new participant for every person in the ledger

      return db.query('select person_id from person where ledger_id = $1;',
          [transaction.ledger_id]).
      then(function(result) {
        return Promise.all(result.rows.map(function(row) {
          return participant.create({
            credit_currency_id: currency_id,
            debit_currency_id: currency_id,
            shared_debt_currency_id: currency_id,
            balance_currency_id: currency_id,
            transaction_id: transaction.transaction_id,
            person_id: row.person_id
          }, db);
        }));
      }).
      then(function(participants) {
        transaction.participants = participants;
        return transaction;
      });
    });
  });
};

dao.update = orm.update;
dao.delete = orm.delete;

dao.find_by_ledger_id = function(ledger_id, db) {
  return orm.find_by('ledger_id', ledger_id, db);
};

dao.find = function(transaction_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return orm.find(transaction_id, db).
    then(fetch_participants(db));
  });
};

function fetch_participants(db) {
  return function(transaction) {
    return participant.find_by_transaction_id(transaction.transaction_id, db).
    then(function(participants) {
      transaction.participants = participants;
      return transaction;
    });
  }
}

dao.find_with_owners = function(transaction_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return Promise.bind({}).
    then(function() {
      return dao.find(transaction_id, db);
    }).
    then(function(transaction) {
      this.transaction = transaction;
      return db.query('select user_id from owner where ledger_id = $1;',
          [transaction.ledger_id]);
    }).
    then(function(result) {
      this.owners = result.rows.map(function(row) {
        return row.user_id;
      });
      return this;
    });
  });
};
