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
var extend = require('../lib/extend');

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
    return transaction.update(req.params.transaction.transaction_id, req.body);
  }).
  then(function(transaction) {
    res.json(transaction);
  }).
  catch(common.handle(res));
};

// TODO credentials check

exports.participants = function(req, res) {
  res.json(req.params.transaction.participants);
};

var participant_arg_schema = {
  "id": "/participant_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "share_debt": {
      "type": "boolean"
    },
    "credit_currency_id": {
      "$ref": "/positive_integer"
    },
    "debit_currency_id": {
      "$ref": "/positive_integer"
    },
    "shared_debt_currency_id": {
      "$ref": "/positive_integer"
    },
    "balance_currency_id": {
      "$ref": "/positive_integer"
    },
    "person_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.add_participant = function(req, res) {
  Promise.try(function() {
    var arg = req.body;
    if (!validate(arg, participant_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    arg.transaction_id = req.params.transaction.transaction_id;
    return session.authorize(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.owners.reduce(function(prev, user_id) {
                return prev || user_id === me.user_id;
              }, false);
    }).
    then(function() {
      return participant.create(arg);
    });
  }).
  then(function(participant) {
    res.json(participant);
  }).
  catch(common.handle(res));
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
