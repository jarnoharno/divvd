var session     = require('../lib/session');
var person      = require('../dao/person');
var validate    = require('../lib/validate');
var close       = require('../lib/close');
var schemas     = require('./schemas');

// GET /api/persons/:id
//
// Get requested person

exports.get = function(req, db) {
  return person.owners(req.params.id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(person.find)(req.params.id, db));
};

// DELETE /api/persons/:id
//
// Delete the requested person

exports.del = function(req, db) {
  return person.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(person.delete)(req.params.id, db));
}

// PUT /api/persons/:id
//
// Update person

exports.put = function(req, db) {
  return validate.check(req.body, schemas.person).
  then(close(person.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(person.update)(req.params.id, req.body, db));
};
