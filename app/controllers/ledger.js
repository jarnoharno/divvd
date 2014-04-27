var common = require('./common');
var colors = require('colors');
var array = require('../lib/array');
var session = require('../lib/session');
var ledger = require('../dao/ledger');
var currency = require('../dao/currency');
var person = require('../dao/person');
var transaction = require('../dao/transaction');
var jsonschema = require('jsonschema');
var deepmerge = require('../lib/deepmerge');
var Promise = require('bluebird');
var Hox = require('../lib/hox');
var validate = require('../lib/validate');
var close = require('../lib/close');
var schemas = require('./schemas');

// GET /api/ledgers
//
// Return all ledgers owned by current user

exports.all = function(req, db) {
  return ledger.find_by_user_id(req.session.user.user_id);
};

// POST /api/ledgers
//
// Creates a new ledger. Admin can create new ledger
// for anyone, other roles only for themselves.

var ledger_arg_schema = {
  "id": "/ledger_param",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "title": {
      "type": "string"
    },
    "total_currency": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string"
        },
        "rate": {
          "$ref": "/positive_number"
        }
      }
    },
    "user_id": {
      "$ref": "/positive_integer"
    }
  }
};

var ledger_arg_default = {
  "title": "New ledger",
  "total_currency": {
    "code": "€",
    "rate": 1.0
  }
};

exports.pos = function(req, db) {
  return validate.check(req.body, ledger_arg_schema).
  then(function() {
    var arg = deepmerge(ledger_arg_default, req.body);
    if (!arg.user_id) {
      arg.user_id = req.session.user.user_id;
    }
    return session.auth(req, /admin/)([{
      user_id: arg.user_id
    }]).
    then(close(ledger.create)(arg, db));
  });
}

// GET /api/ledgers/:id
//
// Returns the requested ledger

exports.get = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(close(ledger.find)(req.params.id, db));
};

// DELETE /api/ledgers/:id
//
// Deletes the requested ledger

exports.del = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(ledger.delete)(req.params.id, db));
};

// PUT /api/ledgers/:id
//
// Update ledger

var update_arg_schema = {
  "id": "/update_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "title": {
      "type": "string"
    },
    "total_currency_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.put = function(req, db) {
  return validate.check(req.body, update_arg_schema).
  then(close(ledger.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(ledger.update)(req.params.id, req.body, db));
};

// GET /api/ledgers/summary
//
// Return summary of all ledgers owned by the currenct user

exports.ledgers_summary = function(req, db) {
  return ledger.ledgers_summary(req.session.user.user_id);
};

// GET /api/ledgers/:id/summary
//
// Return a summary of current users key figures regarding the requested
// ledger

exports.summary = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(function(usr) {
    return ledger.summary(req.params.id, usr.user_id, db);
  });
};

// GET /api/ledgers/:id/balances
//
// Return balances between persons in this ledger

exports.balances = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(close(ledger.balances)(req.params.id, db));
};

// GET /api/ledgers/:id/transactions/summary
//
// Return a summary of current users key figures per transaction regarding
// the requested ledger

exports.transactions_summary = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(function(usr) {
    return ledger.transactions_summary(req.params.id, usr.user_id, db);
  });
};

// PUT /api/ledgers/:id/owners/:od
//
// Update owner

var update_owner_schema = {
  "id": "/update_owner",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "currency_id": {
      "type": "/positive_integer"
    },
		"total_credit_currency_id": {
			"type": "/positive_integer"
		}
  }
};

exports.update_owner = function(req, db) {
  return validate.check(req.body, update_owner_schema).
  then(close(ledger.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(function() {
    return ledger.update_owner(req.params.id, req.params.od, req.body, db);
  });
}

exports.currencies = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(close(currency.find_by_ledger_id)(req.params.id, db));
};

exports.persons = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(close(person.find_by_ledger_id)(req.params.id, db));
};

exports.transactions = function(req, db) {
  return ledger.owners(req.params.id, db).
  then(session.auth(req, /admin|debug/)).
  then(close(transaction.find_by_ledger_id)(req.params.id, db));
};

exports.add_currency = function(req, db) {
  req.body.ledger_id = req.params.id;
  return validate.check(req.body, schemas.currency).
  then(close(ledger.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(currency.create)(req.body, db));
}

exports.add_person = function(req, db) {
  req.body.ledger_id = req.params.id;
  return validate.check(req.body, schemas.person).
  then(close(ledger.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(person.create)(req.body, db));
};

exports.add_transaction = function(req, db) {
  req.body.ledger_id = req.params.id;
  return validate.check(req.body, schemas.transaction).
  then(close(ledger.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(transaction.create)(req.body, db));
}
