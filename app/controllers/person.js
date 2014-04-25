var common = require('./common');
var colors = require('colors');
var array = require('../lib/array');
var session = require('../lib/session');
var ledger = require('../dao/ledger');
var person = require('../dao/person');
var person = require('../dao/person');
var jsonschema = require('jsonschema');
var deepmerge = require('../lib/deepmerge');
var Promise = require('bluebird');
var Hox = require('../lib/hox');
var extend = require('../lib/extend');
var validate = require('../lib/validate');

// GET /api/persons/:person
//
// Returns the requested person
//
// \return {
//  code:string
//  rate:number
//  person_id:integer
// }

exports.get = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.person);
  }).
  catch(common.handle(res));
};

// DELETE /api/persons/:person
//
// Deletes the requested person
//
// \return {
//  code:string
//  rate:number
//  person_id:integer
// }

exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/admin/) ||
            req.params.owners.reduce(function(prev, user_id) {
              return prev || user_id === me.user_id;
            }, false);
  }).
  then(function() {
    return person.delete(req.params.person.person_id);
  }).
  then(function(person) {
    res.json(person);
  }).
  catch(common.handle(res));
};

// PUT /api/persons/:person
//
// Update person
//
// \post_param {
//  currency_id:integer
//  name:string
// }
// \return {
// }

var update_arg_schema = {
  "id": "/update_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "currency_id": {
      "$ref": "/positive_integer"
    },
    "name": {
      "type": "string"
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
    return person.update(req.params.person.person_id, req.body);
  }).
  then(function(person) {
    res.json(person);
  }).
  catch(common.handle(res));
};

// Parses :person GET parameter

exports.param = function(req, res, next, id) {
  person.find_with_owners(id).
  then(function(person_with_owners) {
    extend(req.params, person_with_owners);
    next();
  }).
  catch(common.handle(res));
};
