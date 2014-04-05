var Person = require('../models/person');
var Hox = require('../lib/hox');
var util = require('./util');
var merge = require('../lib/merge');
var Promise = require('bluebird');
var shitorm = require('../lib/shitorm');
var qdb = require('../lib/qdb');

var dao = module.exports = {};

// if currency_id is not supplied, total_currency_id from ledger is used
// if user_id is deduced from name if not given explicitly

// this could probably be nicer...

function insert_person(props, db) {
  if (props.user_id) {
    if (props.name) {
      if (props.currency_id) {
        return db.query('insert into person (name, user_id, currency_id, ledger_id) values ($1, $2, $3, $4) returning name, user_id, currency_id, ledger_id, person_id;',
            [props.name, props.user_id, props.currency_id, props.ledger_id]);
      } else {
        return db.query('insert into person (name, user_id, currency_id, ledger_id) select $1, $2, total_currency_id currency_id, $3 from ledger_settings where ledger_id = $3 limit 1 returning name, user_id, currency_id, ledger_id, person_id;',
            [props.name, props.user_id, props.ledger_id]);
      }
    } else {
      if (props.currency_id) {
        return db.query('insert into person (name, user_id, currency_id, ledger_id) select username, $1, $2, $3 from "user" where user_id = $1 limit 1 returning name, user_id, currency_id, ledger_id, person_id;',
            [props.user_id, props.currency_id, props.ledger_id]);
      } else {
        return db.query('insert into person (name, user_id, currency_id, ledger_id) select username, $1, total_currency_id currency_id, $2 from "user" join ledger_settings on user_id = $1 and ledger_id = $2 limit 1 returning name, user_id, currency_id, ledger_id, person_id;',
            [props.user_id, props.ledger_id]);
      }
    }
  } else if (props.name) {
    if (props.currency_id) {
      return db.query('insert into person (name, currency_id, ledger_id) values ($1, $2, $3) returning name, user_id, currency_id, ledger_id, person_id;',
          [props.name, props.currency_id, props.ledger_id]);
    } else {
      return db.query('insert into person (name, currency_id, ledger_id) select $1, total_currency_id currency_id, $2 from ledger_settings where ledger_id = $2 limit 1 returning name, user_id, currency_id, ledger_id, person_id;',
          [props.name, props.ledger_id]);
    }
  } else {
    return Promise.reject(new Hox(400, 'no name or user_id given'));
  }
}

dao.create = function(props, db) {
  db = db || qdb;
  return insert_person(props, db).
  catch(util.pg_error).
  then(util.first_row).
  then(function(row) {
    return new Person(merge(props, row));
  });
};

dao.find_by_ledger_id = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select name, currency_id, user_id, ledger_id, person_id from person where ledger_id = $1;',
      [ledger_id]).
  then(util.construct_set(Person));
};

// automatically generated stuff

var orm = shitorm({
  props: [
    'name',
    'currency_id',
    'user_id',
    'ledger_id'
  ],
  pk: 'person_id',
  table: 'person',
  constructor: Person
});

dao.delete = orm.delete;
dao.update = orm.update;
