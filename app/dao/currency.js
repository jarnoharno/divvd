var Currency = require('../models/currency');
var db = require('../lib/qdb');
var Hox = require('../lib/hox');

var currency = module.exports = {};

function construct_currency(result) {
  return new Currency(result.rows[0]);
}

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

currency.create = function(props, qdb) {
  if (!qdb) {
    qdb = require('../lib/qdb');
  }
  return qdb.query('insert into currency (code, rate, ledger_id) values ($1, $2, $3) returning code, rate, ledger_id, currency_id;',
      [props.code, props.rate, props.ledger_id]).
  error(unique_violation).
  then(construct_currency);
};

currency.delete = function(currency_id) {
  return db.query('delete from currency where currency_id = $1 returning code, rate, ledger_id, currency_id;',
      [currency_id]).
  then(check_empty).
  then(construct_currency);
};

currency.find = function(currency_id) {
  return db.query('select code, rate, ledger_id, currency_id from currency where currency_id = $1 limit 1;',
      [currency_id]).
  then(check_empty).
  then(construct_currency);
};

currency.update = function(currency_id, currency) {
  var keys_filter = {
    code: true,
    rate: true,
    ledger_id: true
  };

  var keys = Object.keys(currency).filter(function(k) { return keys_filter[k]; });
  var values = keys.map(function(k) { return currency[k]; });
  values.push(currency_id);

  // only keys that match to one of the keys in keys_filter will be
  // concatenated in the query string

  var query =
    'update currency set ' +
    keys.map(function(k, i) {
      return k + ' = $' + (i + 1);
    }).join(', ') +
    ' where currency_id = $' + (keys.length + 1) +
    ' returning code, rate, ledger_id, currency_id;';

  return db.query(query, values).
  error(unique_violation).
  then(check_empty).
  then(construct_currency);
};

