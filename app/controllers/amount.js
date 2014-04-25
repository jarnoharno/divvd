var common = require('./common');
var colors = require('colors');
var array = require('../lib/array');
var session = require('../lib/session');
var ledger = require('../dao/ledger');
var currency = require('../dao/currency');
var person = require('../dao/person');
var transaction = require('../dao/transaction');
var participant = require('../dao/participant');
var amount = require('../dao/amount');
var jsonschema = require('jsonschema');
var deepmerge = require('../lib/deepmerge');
var Promise = require('bluebird');
var Hox = require('../lib/hox');
var validate = require('../lib/validate');
var extend = require('../lib/extend');

// GET /api/amount/:p
//

exports.get = function(req) {
  return session.auth(req, /debug|admin/)().
  then(function() {
    return req.params.amount;
  });
};

// DELETE /api/amount/:amount
//
// Delete the requested amount

exports.del = function(req) {
  return session.auth(req, /admin/)().
  then(function() {
    return amount.delete(req.params.amount.amount_id);
  });
}

// PUT /api/amounts/:t
//
// Update amount

var amount_arg_schema = {
  "id": "/amount_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "amount": {
      "type": "number"
    },
    "currency_id": {
      "$ref": "/positive_integer"
    },
    "transaction_id": {
      "$ref": "/positive_integer"
    },
    "person_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.put = function(req) {
  return validate.check(req.body, amount_arg_schema)().
  then(session.auth(req, /admin/)).
  then(function() {
    return amount.update(req.params.amount.amount_id, req.body);
  });
};

// Parses :amount GET parameter

exports.param = function(req, res, next, id) {

  amount.owners(id).
  then(function(owners) {
    req.params.owners = owners;
    next();
  }).
  catch(common.handle(res));
};
