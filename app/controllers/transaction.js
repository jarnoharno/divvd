var common = require('./common');
var colors = require('colors');
var array = require('../lib/array');
var session = require('../lib/session');
var ledger = require('../dao/ledger');
var currency = require('../dao/currency');
var amount = require('../dao/amount');
var person = require('../dao/person');
var transaction = require('../dao/transaction');
var participant = require('../dao/participant');
var jsonschema = require('jsonschema');
var deepmerge = require('../lib/deepmerge');
var Promise = require('bluebird');
var Hox = require('../lib/hox');
var validate = require('../lib/validate');
var extend = require('../lib/extend');
var schemas = require('./schemas');
var close = require('../lib/close');

// GET /api/transaction/:t
//
// Returns the requested transaction

exports.get = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.transaction);
  }).
  catch(common.handle(res));
};

// DELETE /api/transactions/:transaction
//
// Deletes the requested transaction

exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    return transaction.delete(req.params.transaction.transaction_id);
  }).
  then(function(transaction) {
    res.json(transaction);
  }).
  catch(common.handle(res));
};

// PUT /api/transactions/:t
//
// Update transaction

var transaction_arg_schema = {
  "id": "/transaction_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "description": {
      "type": "string"
    },
    "date": {
      "type": "string",
      "format": "date-time"
    },
    "type": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "transfer": {
      "type": "boolean"
    },
    "currency_id": {
      "$ref": "/positive_integer"
    },
    "ledger_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.put = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, transaction_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    return session.authorize_spoof(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.owners.reduce(function(prev, user_id) {
                return prev || user_id === me.user_id;
              }, false);
    });
  }).
  then(function() {
    console.log(req.body);
    return transaction.update(req.params.transaction.transaction_id, req.body);
  }).
  then(function(transaction) {
    res.json(transaction);
  }).
  catch(common.handle(res));
};

// PUT /api/transactions/:t/summary
//
// Update transaction owner summary page
//
// \post_param {
//  user_balance_currency_id:integer
//  total_value_currency_id:integer
//  user_credit_currency_id:integer
// }
// \return {
// }

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

exports.update_summary = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, update_summary_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    return session.authorize_spoof(req, function(me) {
      return  req.params.owners.reduce(function(prev, user_id) {
                return prev || user_id === me.user_id;
              }, false);
    });
  }).
  then(function(usr) {
    return transaction.update_summary(req.params.transaction.transaction_id,
				usr.user_id, req.body);
  }).
  then(function(obj) {
    res.json(obj);
  }).
  catch(common.handle(res));
};

exports.participants = function(req, res) {
  res.json(req.params.transaction.participants);
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

// Parses :transaction GET parameter
// we *definitely* don't need this heavy object every time... change this
// behaviour later

exports.param = function(req, res, next, id) {
  transaction.find_with_owners(id).
  then(function(obj) {
    extend(req.params, obj);
    next();
  }).
  catch(common.handle(res));
};
