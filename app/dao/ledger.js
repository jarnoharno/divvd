var Ledger = require('../models/ledger');
var currency = require('./currency');
var user = require('./user');
var person = require('./person');
var db = require('../lib/qdb');
var array = require('../lib/array');
var Hox = require('../lib/hox');
var Promise = require('bluebird');
var merge = require('../lib/merge');
//var orm = require('../lib/orm');

var dao = module.exports = {};

function construct_ledger(result) {
  return new Ledger(result.rows[0]);
}

function insert_ledger(title, qdb) {
  return qdb.query('insert into ledger (title) values ($1) returning ledger_id;',
      [title]).
  then(function(result) {
    return result.rows[0].ledger_id;
  });
}

function insert_owner(user_id, ledger_id, qdb) {
  return qdb.query('insert into owner (user_id, ledger_id) values ($1, $2);',
      [user_id, ledger_id]);
}

function insert_ledger_settings(ledger_id, total_currency_id, qdb) {
  return qdb.query('insert into ledger_settings (ledger_id, total_currency_id) values ($1, $2);',
      [ledger_id, total_currency_id]);
}

// Creates a new ledger with a transaction
//
// Creates a new ledger and inserts a new currency as the total value
// currency. Owner is inserted as a person in the ledger.
//
// title:string
// total_currency: {
//   code:string
//   rate:number
// }
// user_id:integer owner's user_id
//
// return () -> Promise Ledger

dao.create = function(props, qdb) {
  qdb = qdb || require('../lib/qdb');

  return qdb.transaction(function(query) {

    // enable transaction
    var q = { query: query };

    // bind to-be-returned ledger
    return Promise.bind(new Ledger(props)).

    // insert ledger
    then(function() {
      return insert_ledger(this.title, q);
    }).
    then(function(ledger_id) {
      this.ledger_id = ledger_id;
    }).

    // insert currency
    then(function() {
      return currency.create(
        merge(props.total_currency, { ledger_id: this.ledger_id }), q);
    }).
    then(function(currency) {
      this.total_currency_id = currency.currency_id;
      this.currencies = [currency];
    }).

    // insert settings
    then(function() {
      return insert_ledger_settings(this.ledger_id, this.total_currency_id, q);
    }).

    // insert owner
    then(function() {
      return insert_owner(props.user_id, this.ledger_id, q);
    }).

    // insert person
    then(function() {
      return user.find(props.user_id, q);
    }).
    then(function(user) {
      this.owners = [user];
      return person.create({
        name: user.username,
        user_id: user.user_id,
        currency_id: this.total_currency_id,
        ledger_id: this.ledger_id
      }, q);
    }).
    then(function(person) {
      this.persons = [person];
    }).

    then(function() {
      return this; // phew!
    });
  });
};

// automatically generated stuff
/*
var ledger_orm = orm({
  props: [
    'title'
  ],
  pk: 'ledger_id',
  table: 'ledger',
  constructor: Ledger
});

dao.delete = ledger_orm.generate_delete();
*/
dao.delete = function(ledger_id, qdb) {
  qdb = qdb || require('../lib/qdb');
  return qdb.query('delete from ledger where ledger_id = $1 returning title, ledger_id;',
      [ledger_id]).
  then(construct_ledger);
};

dao.find = function(pk) {
  var query =
      'select ' + obj.props_string + ' from ' + obj.table + ' where ' +
      obj.pk + ' = $1 limit 1;';
  return db.query(query, [pk]).
  then(check_empty).
  then(construct);
};

dao.update = function(pk, props) {

  var keys = Object.keys(props).filter(function(k) {
    return obj.keys_filter[k];
  });
  var values = keys.map(function(k) {
    return props[k];
  });
  values.push(pk);

  // only keys that match to one of the keys in keys_filter will be
  // concatenated in the query string

  var query =
    'update ' + obj.table + ' set ' +
    keys.map(function(k, i) {
      return k + ' = $' + (i + 1);
    }).join(', ') +
    ' where ' + obj.pk + ' = $' + (keys.length + 1) +
    ' returning ' + obj.props_string + ';';

  return db.query(query, values).
  error(unique_violation).
  then(check_empty).
  then(construct);
};

