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

var dao = module.exports = {};

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

dao.create = function(props, db) {
  db = db || qdb;

  return db.transaction(function(query) {

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
      console.log('HOLA');
      console.log(this);
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

dao.find = function(ledger_id, db) {
  db = db || qdb;
  return db.transaction(function(query) {
    var q = { query: query };
    return Promise.bind(new Ledger({ ledger_id: ledger_id })).

    // select ledger
    then(function() {
      return select_ledger(ledger_id, q);
    }).
    then(function(ledger) {
      extend(this, ledger);
    }).

    // select owners
    then(function() {
      return user.find_by_ledger_id(ledger_id, q);
    }).
    then(function(users) {
      this.owners = users;
    }).

    // select persons
    then(function() {
      return person.find_by_ledger_id(ledger_id, q);
    }).
    then(function(persons) {
      this.persons = persons;
    }).

    // select currencies
    then(function() {
      return currency.find_by_ledger_id(ledger_id, q);
    }).
    then(function(currencies) {
      this.currencies = currencies;
    }).

    then(function() {
      return this;
    });
  });
};

dao.find_by_user_id = function(user_id, db) {
  db = db || qdb;
  return db.query('select title, total_currency_id, ledger_id from ledger natural join ledger_settings natural join owner where user_id = $1;',
      [user_id]).
  then(function(result) {
    return result.rows.map(function(row) {
      return new Ledger(row);
    });
  });
}

// props = {
//  title:string
//  total_currency_id:integer
// }

// we might be able to do updates with pg views

dao.update = function(ledger_id, props, db) {
  db = db || qdb;
  return db.transaction(function(query) {
    var ret = new Ledger(props);
    ret.ledger_id = ledger_id;
    var p = Promise.resolve();
    if (props.title) {
      p.then(function() {
        return query('update ledger set title = $1 where ledger_id = $2 returning title;',
            [props.title, ledger_id]).
        catch(util.pg_error).
        then(util.first_row).
        then(function(row) {
          ret.title = row.title;
        });
      });
    }
    if (props.total_currency_id) {
      p.then(function() {
        return query('update ledger_settings set total_currency_id = $1 where ledger_id = $2;',
            [props.total_currency_id, ledger_id]);
      });
    }
    return p.then(function() {
      return ret;
    });
  });
};

// \return [user_id]

dao.find_owners = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select user_id from owner where ledger_id = $1;',
      [ledger_id]).
  then(function(result) {
    return result.rows;
  });
};

// automatically generated stuff

var orm = shitorm({
  props: [
    'title'
  ],
  pk: 'ledger_id',
  table: 'ledger',
  constructor: Ledger
});

dao.delete = orm.delete;

// private

function insert_ledger(title, db) {
  return db.query('insert into ledger (title) values ($1) returning ledger_id;',
      [title]).
  then(util.first_row).
  then(function(row) {
    return row.ledger_id;
  });
}

function insert_owner(user_id, ledger_id, db) {
  return db.query('insert into owner (user_id, ledger_id) values ($1, $2);',
      [user_id, ledger_id]);
}

function insert_ledger_settings(ledger_id, total_currency_id, db) {
  return db.query('insert into ledger_settings (ledger_id, total_currency_id) values ($1, $2);',
      [ledger_id, total_currency_id]);
}

function select_ledger(ledger_id, db) {
  return db.query('select title, total_currency_id, ledger_id from ledger natural join ledger_settings where ledger_id = $1 limit 1;',
      [ledger_id]).
  then(util.check_empty).
  then(util.first_row).
  then(function(row) {
    return new Ledger(row);
  });
}
