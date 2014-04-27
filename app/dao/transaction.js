var Ledger = require('../models/ledger');
var currency = require('./currency');
var user = require('./user');
var amount = require('./amount');
var person = require('./person');
var Hox = require('../lib/hox');
var Promise = require('bluebird');
var merge = require('../lib/merge');
var shitorm = require('../lib/shitorm');
var util = require('./util');
var extend = require('../lib/extend');
var qdb = require('../lib/qdb');
var Transaction = require('../models/transaction');
var Participant = require('../models/participant');
var participant = require('./participant');
var dada = require('../lib/dada');

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

dao.update = orm.update;
dao.delete = orm.delete;

dao.currency = dada.single(function(pk, db) {
  return db.query(
      'select currency_id from transaction where transaction_id = $1;',
      [pk]);
});

var create_transaction = orm.create_with_defaults({
  currency_id: {
    table: {
      name: 'ledger_settings',
      where: 'ledger_id',
      col: 'total_currency_id'
    }
  }
});

dao.create = function(props, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return create_transaction(props, db).
    then(function(transaction) {

      // create settings for every owner

      return db.query(
          'insert into owner_transaction_settings (owner_id, transaction_id, ' +
          'owner_balance_currency_id, total_value_currency_id, ' +
          'owner_total_credit_currency_id) select owner_id, $1, $2, $2, $2 ' +
          'from owner where ledger_id = $3;',
          [transaction.transaction_id,
          transaction.currency_id,
          transaction.ledger_id]).

      // create new participant for every person in the ledger

      then(function() {
        return db.query(
            'insert into participant ' +
            '(currency_id, transaction_id, person_id) ' +
            'select $1, $2, person_id from person where ledger_id = $3 ' +
            'returning *;',
            [transaction.currency_id,
            transaction.transaction_id,
            transaction.ledger_id]);
      }).
      then(util.construct_set(Participant)).
      then(function(p) {
        transaction.participants = p;
        transaction.amounts = [];
        return transaction;
      });
    });
  });
};

dao.update_summary = function(transaction_id, user_id, props, db) {
	db = db || qdb;
	var set = Object.keys(props).map(function(k, i) {
		return k + ' = $' + (i + 3);
	}).join(', ');
	return db.query('update owner_transaction_settings set ' + set +
		' where owner_transaction_settings_id =' +
    ' (select owner_transaction_settings_id from owner_transaction_settings' +
    ' join owner using (owner_id) where user_id = $1 and transaction_id = $2)' +
    ' returning *;',
		[user_id, transaction_id].concat(Object.keys(props).map(function(k) {
			return props[k];
		}))
	).
	then(util.check_empty).
	then(util.first_row);
};

dao.find_by_ledger_id = function(ledger_id, db) {
  return db.query('select * from transaction_view where ledger_id = $1;',
      [ledger_id]).
  then(util.construct_set(Transaction));
};

dao.find = function(pk, db) {
  return db.transaction(function(db) {
    return db.query('select * from transaction_view where transaction_id = $1;',
        [pk]).
    then(util.construct(Transaction)).
    then(function(t) {
      return participant.find_by_transaction_id(t.transaction_id, db).
      then(function(p) {
        t.participants = p;
      }).
      then(function() {
        return amount.find_by_transaction_id(t.transaction_id, db);
      }).
      then(function(a) {
        t.amounts = a;
        return t;
      });
    }); 
  });
};

dao.owners = dada.array(function(pk, db) {
  return db.query(
      'select user_id from transaction ' +
      'join owner using (ledger_id) where transaction_id = $1;',
      [pk]);
});
