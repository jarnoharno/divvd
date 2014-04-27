var user          = require('../dao/user');
var ledger        = require('../dao/ledger');
var close         = require('../lib/close');
var session       = require('../lib/session');

// GET /api/users
//
// Returns all users in the system. Not available to users.

exports.all = function(req, db) {
  return session.auth(req, /debug|admin/)().
  catch(session.unspoof).
  then(close(user.all)(db));
}

// GET /api/users/:id
//
// Returns the requested user information.

exports.get = function(req, res) {
  return session.auth(req, /debug|admin/)(req.params.id).
  then(close(user.find)(req.params.id, db));
}

// DELETE /api/users/:id
//
// Remove user from the system and all sessions
// associated with the user. Not available to debug users.

exports.del = function(req, res) {
  return session.auth(req, /debug|admin/)(req.params.id).
  then(close(user.delete)(req.params.id, db));
}

// GET /api/users/:id/ledgers
//
// Returns the requested user's ledgers

exports.ledgers = function(req, res) {
  return session.auth(req, /debug|admin/)(req.params.id).
  then(close(ledger.find_by_user_id)(req.params.id, db));
}
