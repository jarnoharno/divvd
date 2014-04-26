var session       = require('../lib/session');
var currency      = require('../dao/currency');
var validate      = require('../lib/validate');
var close         = require('../lib/close');
var schemas       = require('./schemas');

// GET /api/currencies/:id
//
// Get requested currency

exports.get = function(req, db) {
  return currency.owners(req.params.id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(currency.find)(req.params.id, db));
};

// DELETE /api/currencies/:id
//
// Delete the requested currency

exports.del = function(req, db) {
  return currency.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(currency.delete)(req.params.id, db));
}

// PUT /api/currencies/:id
//
// Update currency

exports.put = function(req, db) {
  return validate.check(req.body, schemas.currency).
  then(close(currency.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(currency.update)(req.params.id, req.body, db));
};
