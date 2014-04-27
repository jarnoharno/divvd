var session = require('../lib/session');
var amount = require('../dao/amount');
var transaction = require('../dao/transaction');
var participant = require('../dao/participant');
var validate = require('../lib/validate');
var schemas = require('./schemas');
var close = require('../lib/close');

// GET /api/transaction/:id
//
// Returns the requested transaction

exports.get = function(req, db) {
  return transaction.owners(req.params.id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(transaction.find)(req.params.id, db));
};

// DELETE /api/transactions/:id
//
// Deletes the requested transaction

exports.del = function(req, db) {
  return transaction.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(transaction.delete)(req.params.id, db));
};

// PUT /api/transactions/:id
//
// Update transaction

exports.put = function(req, db) {
  return validate.check(req.body, schemas.transaction).
  then(close(transaction.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(transaction.update)(req.params.id, req.body, db));
};

// PUT /api/transactions/:t/summary
//
// Update transaction owner summary page

var update_summary_schema = {
  "id": "/update_summary",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "owner_balance_currency_id": {
      "$ref": "/positive_integer"
    },
    "total_value_currency_id": {
      "$ref": "/positive_integer"
    },
    "owner_total_credit_currency_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.update_summary = function(req, db) {
  return validate.check(req.body, update_summary_schema).
  then(close(transaction.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(function(usr) {
    return transaction.update_summary(req.params.id, usr.user_id, req.body);
  });
};

exports.participants = function(req, db) {
  return transaction.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(participant.find_by_transaction_id)(req.params.id, db));
};

exports.add_participant = function(req, db) {
  req.body.transaction_id = req.params.id;
  return validate.check(req.body, schemas.participant).
  then(close(transaction.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(participant.create)(req.body, db));
}

exports.add_amount = function(req, db) {
  req.body.transaction_id = req.params.id;
  return validate.check(req.body, schemas.amount).
  then(close(transaction.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(amount.create)(req.body, db));
}
