var session       = require('../lib/session');
var amount        = require('../dao/amount');
var validate      = require('../lib/validate');
var close         = require('../lib/close');
var schemas       = require('./schemas')

// GET /api/amount/:id
//
// Get requested amount

exports.get = function(req, db) {
  return amount.owners(req.params.id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(amount.find)(req.params.id, db));
};

// DELETE /api/amount/:id
//
// Delete the requested amount

exports.del = function(req, db) {
  return amount.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(amount.delete)(req.params.id, db));
}

// PUT /api/amounts/:id
//
// Update amount

exports.put = function(req, db) {
  return validate.check(req.body, schemas.amount).
  then(close(amount.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(amount.update)(req.params.id, req.body, db));
};
