var session       = require('../lib/session');
var participant   = require('../dao/participant');
var validate      = require('../lib/validate');
var close         = require('../lib/close');
var schemas       = require('./schemas');

// GET /api/participants/:id
//
// Get requested participant

exports.get = function(req, db) {
  return participant.owners(req.params.id, db).
  then(session.auth(req, /debug|admin/)).
  then(close(participant.find)(req.params.id, db));
};

// DELETE /api/participants/:id
//
// Delete the requested participant

exports.del = function(req, db) {
  return participant.owners(req.params.id, db).
  then(session.auth(req, /admin/)).
  then(close(participant.delete)(req.params.id, db));
}

// PUT /api/participants/:id
//
// Update participant

exports.put = function(req, db) {
  return validate.check(req.body, schemas.participant).
  then(close(participant.owners)(req.params.id, db)).
  then(session.auth(req, /admin/)).
  then(close(participant.update)(req.params.id, req.body, db));
};
