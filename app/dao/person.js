var Person = require('../models/person');
var Hox = require('../lib/hox');
var util = require('./util');
var merge = require('../lib/merge');
var Promise = require('bluebird');

var dao = module.exports = {};

function insert_person(props, qdb) {
  if (props.user_id) {
    if (props.name) {
      return qdb.query('insert into person (name, user_id, currency_id, ledger_id) values ($1, $2, $3, $4) returning name, user_id, currency_id, ledger_id, person_id;',
          [props.name, props.user_id, props.currency_id, props.ledger_id]);
    } else {
      return qdb.query('insert into person (name, user_id, currency_id, ledger_id) select username, $1, $2, $3 from "user" where user_id = $1 limit 1 returning name, user_id, currency_id, ledger_id, person_id;',
          [props.user_id, props.currency_id, props.ledger_id]);
    }
  } else if (props.name) {
    return qdb.query('insert into person (name, currency_id, ledger_id) values ($1, $2, $3) returning name, user_id, currency_id, ledger_id, person_id;',
        [props.name, props.currency_id, props.ledger_id]);
  } else {
    return Promise.reject(new Hox(400, 'no name or user_id given'));
  }
}

dao.create = function(props, qdb) {
  if (!qdb) {
    qdb = require('../lib/qdb');
  }
  return insert_person(props, qdb).
  then(util.first_row).
  then(function(row) {
    return new Person(merge(props, row));
  });
};
