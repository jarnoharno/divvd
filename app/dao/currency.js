var Currency = require('../models/currency');
var qdb = require('../lib/qdb');
var Hox = require('../lib/hox');
var util = require('./util');
var shitorm = require('../lib/shitorm');

var dao = module.exports = {};

function check_empty(result) {
  if (result.rowCount == 0) {
    throw new Hox(400, 'currency not found');
  }
  return result;
}

function unique_violation(err) {
  if (err.cause.code == 23505) {
    // postgresql unique_violation
    throw new Hox(400, 'currency already exists');
  }
  // unidentified error
  throw err;
}

// all methods return a Currency

dao.create = function(props, db) {
  db = db || qdb
  return db.query('insert into currency (code, rate, ledger_id) values ($1, $2, $3) returning code, rate, ledger_id, currency_id;',
      [props.code, props.rate, props.ledger_id]).
  error(unique_violation).
  then(util.construct(Currency));
};

dao.find_by_ledger_id = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select code, rate, ledger_id, currency_id from currency where ledger_id = $1;',
      [ledger_id]).
  then(util.construct_set(Currency));
};

dao.delete = function(currency_id, db) {
  db = db || qdb;
  return db.query('delete from currency where currency_id = $1 returning code, rate, ledger_id, currency_id;',
      [currency_id]).
  //then(check_empty).
  then(construct(Currency));
};

dao.find = function(currency_id) {
  return db.query('select code, rate, ledger_id, currency_id from currency where currency_id = $1 limit 1;',
      [currency_id]).
  //then(check_empty).
  then(construct(Currency));
};

// automatically generated stuff

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

dao.delete = orm.delete;
dao.update = orm.update;
