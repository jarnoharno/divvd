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

// GET /api/ledgers
//
// Return all ledgers owned by current user
//
// \return [{
//  title:string
//  total_currency_id:integer
//  ledger_id:integer
// }]

exports.ledgers = function(req, res) {
  session.current_user(req).
  then(function(usr) {
    return ledger.find_by_user_id(usr.user_id);
  }).
  then(function(ledgers) {
    res.json(ledgers);
  }).
  catch(common.handle(res));
};

// POST /api/ledgers
//
// Creates a new ledger. Admin can create new ledger
// for anyone, other roles only for themselves.
//
// \post_param title:string                   (default:"New ledger")
// \post_param total_currency: {
//   code:string
//   rate:number
// }
// \post_param user_id:                       (default: <current user>)
//
// \return {
//  title:string
//  currency_id:integer
//  owners: [{
//    username:string
//    user_id:integer
//  }]
//  ledger_id:integer
// }

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

// maybe defaults should be defined only at the database level?
exports.create = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, ledger_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    var arg = deepmerge(ledger_arg_default, req.body);
    if (!arg.user_id) {
      arg.user_id = req.session.user.user_id;
    }
    return session.authorize(req, function(me) {
      return  me.user_id === arg.user_id ||
              me.role.match(/admin/);
    }).
    then(function() {
      return ledger.create(arg);
    });
  }).
  then(function(ledger) {
    res.json(ledger);
  }).
  catch(common.handle(res));
}

// GET /api/ledgers/:ledgerId
//
// Returns the requested ledger
//
// \return {
//  title:string
//  currency_id:integer
//  owners: [{
//    username:string
//    user_id:integer
//  }]
//  ledger_id:integer
// }

exports.ledger = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/debug|admin/) ||
            req.params.ledger.owners.reduce(function(prev, owner) {
              return prev || owner.user_id === me.user_id;
            }, false);
  }).
  then(function() {
    res.json(req.params.ledger);
  }).
  catch(common.handle(res));
};

// DELETE /api/ledgers/:ledger
//
// Deletes the requested ledger
//
// \return {
//  title:string
//  total_currency_id:integer
//  ledger_id:integer
// }

exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.role.match(/admin/) ||
            req.params.ledger.owners.reduce(function(prev, owner) {
              return prev || owner.user_id === me.user_id;
            }, false);
  }).
  then(function() {
    return ledger.delete(req.params.ledger.ledger_id);
  }).
  then(function(ledger) {
    res.json(ledger);
  }).
  catch(common.handle(res));
};

// PUT /api/ledgers/:ledger
//
// Update ledger
//
// \post_param {
//  title:string
//  total_currency_id:integer
// }
// \return {
//  title:string
//  total_currency_id:integer
//  ledger_id:integer
// }

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

exports.update = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, update_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    return session.authorize_spoof(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.ledger.owners.reduce(function(prev, owner) {
                return prev || owner.user_id === me.user_id;
              }, false);
    });
  }).
  then(function() {
    return ledger.update(req.params.ledger.ledger_id, req.body);
  }).
  then(function(ledger) {
    res.json(ledger);
  }).
  catch(common.handle(res));
};

// GET /api/ledgers/summary
//
// Return summary of all ledgers owned by the currenct user

exports.ledgers_summary = function(req, res) {
  session.current_user(req).
  then(function(usr) {
    return ledger.ledgers_summary(usr.user_id);
  }).
  then(function(summary) {
    res.json(summary);
  }).
  catch(common.handle(res));
};

// GET /api/ledgers/:ledger/transactions/summary
//
// Return a summary of transactions in this ledger from the viewpoint
// of the current user

exports.summary = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  req.params.ledger.owners.reduce(function(prev, owner) {
              return prev || owner.user_id === me.user_id;
            }, false);
  }).
  then(function(usr) {
    return ledger.summary(req.params.ledger.ledger_id, usr.user_id);
  }).
  then(function(transactions) {
    res.json(transactions);
  }).
  catch(common.handle(res));
};


// PUT /api/ledgers/:ledger/owners/:owner
//
// Update owner
//
// \post_param {
//  currency_id:integer
// }
// \return {
//  user_id:integer
//  ledger_id:integer
//  currency_id:integer
// }

var update_owner_schema = {
  "id": "/update_owner",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "currency_id": {
      "type": "/positive_integer"
    }
  }
};

exports.update_owner = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, update_owner_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    return session.authorize_spoof(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.ledger.owners.reduce(function(prev, owner) {
                return prev || owner.user_id === me.user_id;
              }, false);
    });
  }).
  then(function() {
    req.body.user_id = req.params.owner.user_id;
    return ledger.update_owner(req.params.ledger.ledger_id, req.body);
  }).
  then(function(ledger) {
    res.json(ledger);
  }).
  catch(common.handle(res));
}

// TODO credentials check
// this could be taken from req.param.ledger!

exports.currencies = function(req, res) {
  return currency.find_by_ledger_id(req.params.ledger.ledger_id).
  then(function(currencies) {
    res.json(currencies);
  }).
  catch(common.handle(res));
};

// TODO credentials check
// this could be taken from req.param.ledger!

exports.persons = function(req, res) {
  return person.find_by_ledger_id(req.params.ledger.ledger_id).
  then(function(persons) {
    res.json(persons);
  }).
  catch(common.handle(res));
};

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
    }
  }
};

var currency_arg_default = {
  "code": "€",
  "rate": 1.0
};

exports.add_currency = function(req, res) {
  Promise.try(function() {
    if (!validate(req.body, currency_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }
    var arg = deepmerge(currency_arg_default, req.body);
    arg.ledger_id = req.params.ledger.ledger_id;
    return session.authorize(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.ledger.owners.reduce(function(prev, owner) {
                return prev || owner.user_id === me.user_id;
              }, false);
    }).
    then(function() {
      return currency.create(arg);
    });
  }).
  then(function(currency) {
    res.json(currency);
  }).
  catch(common.handle(res));
}

var person_arg_schema = {
  "id": "/person_arg",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "name": {
      "type": "string"
    },
    "currency_id": {
      "$ref": "/positive_number"
    },
    "user_id": {
      "$ref": "/positive_number"
    }
  }
};

exports.add_person = function(req, res) {
  Promise.try(function() {
    var arg = req.body;
    if (!validate(arg, person_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }

    arg.ledger_id = req.params.ledger.ledger_id;

    return session.authorize(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.ledger.owners.reduce(function(prev, owner) {
                return prev || owner.user_id === me.user_id;
              }, false);
    }).
    then(function() {
      return person.create(arg);
    });
  }).
  then(function(person) {
    res.json(person);
  }).
  catch(common.handle(res));
}

exports.transactions = function(req, res) {
  return transaction.find_by_ledger_id(req.params.ledger.ledger_id).
  then(function(transactions) {
    res.json(transactions);
  }).
  catch(common.handle(res));
};

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
    }
  }
};

exports.add_transaction = function(req, res) {
  Promise.try(function() {
    var arg = req.body;
    if (!validate(arg, transaction_arg_schema)) {
      throw new Hox(400, "unexpected parameters");
    }

    arg.ledger_id = req.params.ledger.ledger_id;
    arg.currency_id = arg.currency_id || req.params.ledger.total_currency_id;

    return session.authorize(req, function(me) {
      return  me.role.match(/admin/) ||
              req.params.ledger.owners.reduce(function(prev, owner) {
                return prev || owner.user_id === me.user_id;
              }, false);
    }).
    then(function() {
      return transaction.create(arg);
    });
  }).
  then(function(transaction) {
    res.json(transaction);
  }).
  catch(common.handle(res));
}

// Parses :ledger GET parameter
// we don't need the full ledger object each time but this is just easier

exports.param = {};
exports.param.ledger = function(req, res, next, id) {
  ledger.find(id).
  then(function(ledger) {
    req.params.ledger = ledger;
    next();
  }).
  catch(common.handle(res));
};

exports.param.owner = function(req, res, next, id) {
  req.params.owner = {
    user_id: id
  };
  next();
};

exports.param.transaction = function(req, res, next, id) {
  req.params.transaction = {
    transaction_id: id
  };
  next();
};

