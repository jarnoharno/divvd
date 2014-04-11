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

// GET /api/participant/:p
//
// Returns the requested participant

exports.get = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.participant);
  }).
  catch(common.handle(res));
};

// DELETE /api/participant/:participant
//
// Deletes the requested participant

exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    return participant.delete(req.params.participant.participant_id);
  }).
  then(function(participant) {
    res.json(participant);
  }).
  catch(common.handle(res));
};

// PUT /api/participants/:t
//
// Update participant

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
    },
    "transaction_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.put = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, participant_arg_schema)) {
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
    return participant.update(req.params.participant.participant_id, req.body);
  }).
  then(function(participant) {
    res.json(participant);
  }).
  catch(common.handle(res));
};

// TODO credentials check

exports.amounts = function(req, res) {
  res.json(req.params.participant.amounts);
};

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
    }
  }
};

exports.add_amount = function(req, res) {
  Promise.try(function() {
    var arg = req.body;
    if (!validate(arg, amount_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    arg.currency_id = arg.currency_id ||
        req.params.participant.balance_currency_id;
    arg.participant_id = req.params.participant.participant_id;
    return session.authorize(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.owners.reduce(function(prev, user_id) {
                return prev || user_id === me.user_id;
              }, false);
    }).
    then(function() {
      return amount.create(arg);
    });
  }).
  then(function(amount) {
    res.json(amount);
  }).
  catch(common.handle(res));
}

// Parses :participant GET parameter
// we *definitely* don't need this heavy object every time... change this
// behaviour later

exports.param = function(req, res, next, id) {
  participant.find_with_owners(id).
  then(function(obj) {
    extend(req.params, obj);
    next();
  }).
  catch(common.handle(res));
};
