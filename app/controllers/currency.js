var common = require('./common');
var colors = require('colors');
var array = require('../lib/array');
var session = require('../lib/session');
var ledger = require('../dao/ledger');
var currency = require('../dao/currency');
var person = require('../dao/person');
var jsonschema = require('jsonschema');
var deepmerge = require('../lib/deepmerge');
var Promise = require('bluebird');
var Hox = require('../lib/hox');
var extend = require('../lib/extend');
var validate = require('../lib/validate');

// GET /api/currencies/:currency
//
// Returns the requested currency
//
// \return {
//  code:string
//  rate:number
//  currency_id:integer
// }

exports.get = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.currency);
  }).
  catch(common.handle(res));
};

// DELETE /api/currencies/:currency
//
// Deletes the requested currency
//
// \return {
//  code:string
//  rate:number
//  currency_id:integer
// }

exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    return currency.delete(req.params.currency.currency_id);
  }).
  then(function(currency) {
    res.json(currency);
  }).
  catch(common.handle(res));
};

// PUT /api/currencies/:currency
//
// Update ledger
//
// \post_param {
//  code:string
//  rate:number
//  ledger_id:integer
// }
// \return {
// }

var update_arg_schema = {
  "id": "/update_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "code": {
      "type": "string"
    },
    "rate": {
      "$ref": "/positive_number"
    }
  }
};

exports.put = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, update_arg_schema)) {
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
    return currency.update(req.params.currency.currency_id, req.body);
  }).
  then(function(currency) {
    res.json(currency);
  }).
  catch(common.handle(res));
};

// Parses :currency GET parameter

exports.param = function(req, res, next, id) {
  currency.find_with_owners(id).
  then(function(currency_with_owners) {
    extend(req.params, currency_with_owners);
    next();
  }).
  catch(common.handle(res));
};
