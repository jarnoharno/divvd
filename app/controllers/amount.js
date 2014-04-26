var session = require('../lib/session');
var amount = require('../dao/amount');
var validate = require('../lib/validate');

// GET /api/amount/:amount_id
//
// Get requested amount

exports.get = function(req, db) {
  var amount_id = req.params.amount_id;
  return amount.owners(amount_id, db)().
  then(session.auth(req, /debug|admin/)).
  then(amount.find(amount_id, db));
};

// DELETE /api/amount/:amount
//
// Delete the requested amount

exports.del = function(req, db) {
  var amount_id = req.params.amount_id;
  return amount.owners(amount_id, db)().
  then(session.auth(req, /admin/)).
  then(amount.del(amount_id, db));
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

exports.put = function(req, db) {
  var amount_id = req.params.amount_id;
  return validate.check(req.body, amount_arg_schema).
  then(amount.owners(amount_id, db)).
  then(session.auth(req, /admin/)).
  then(amount.update(req.params.amount_id, req.body, db));
};
