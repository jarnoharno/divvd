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
// Returns the requested amount

exports.get = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.amount);
  }).
  catch(common.handle(res));
};

// DELETE /api/amount/:amount
//
// Delete the requested amount

exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    return amount.delete(req.params.amount.amount_id);
  }).
  then(function(amount) {
    res.json(amount);
  }).
  catch(common.handle(res));
};

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
    "participant_id": {
      "$ref": "/positive_integer"
    }
  }
};

exports.put = function(req, res) {
  var arg = req.body;
  Promise.try(function() {
    if (!validate(arg, amount_arg_schema)) {
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
    return amount.update(req.params.amount.amount_id, arg);
  }).
  then(function(amount) {
    res.json(amount);
  }).
  catch(common.handle(res));
};

// Parses :amount GET parameter
// we *definitely* don't need this heavy object every time... change this
// behaviour later

exports.param = function(req, res, next, id) {
  amount.find_with_owners(id).
  then(function(obj) {
    extend(req.params, obj);
    next();
  }).
  catch(common.handle(res));
};
