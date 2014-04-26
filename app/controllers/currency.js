var common = require('./common');
var session = require('../lib/session');
var currency = require('../dao/currency');
var validate = require('../lib/validate');
var close = require('../lib/close');

// GET /api/currency/:currency_id
//
// Get requested currency

exports.get = function(req, db) {
  var currency_id = req.params.currency_id;
  return currency.owners(currency_id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(currency.find)(currency_id, db));
};

// DELETE /api/currency/:currency
//
// Delete the requested currency

exports.del = function(req, db) {
  var currency_id = req.params.currency_id;
  return currency.owners(currency_id, db).
  then(session.auth(req, /admin/)).
  then(close(currency.del)(currency_id, db));
}

// PUT /api/currencies/:t
//
// Update currency

var currency_arg_schema = {
  "id": "/currency_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
  "code": {
      "type": "string"
    },
    "rate": {
      "$ref": "/positive_number"
    },
    "ledger_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.put = function(req, db) {
  var currency_id = req.params.currency_id;
  return validate.check(req.body, currency_arg_schema).
  then(close(currency.owners)(currency_id, db)).
  then(session.auth(req, /admin/)).
  then(close(currency.update)(req.params.currency_id, req.body, db));
};
