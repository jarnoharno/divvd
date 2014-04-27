var common      = require('./common');
var user        = require('../dao/user');
var session     = require('../lib/session');
var close       = require('../lib/close');

// GET /api/account
//
// Returns the logged in user information

exports.account = function(req) {
  return session.current_user(req);
};

// GET /api/logout
//
// Logs out user

exports.logout = function(req) {
  return session.current_user(req).
  then(close(session.delete_current)(req));
};

// POST /api/login
//
// Logs user in

exports.login = function(req, db) {
  return user.find_username_and_password(req.body, db).
  then(function(usr) {
    req.session.user = usr;
    return usr;
  });
};

// POST /api/signup
//
// Signs user up

exports.signup = function(req, db) {
  return user.create(req.body, db).
  then(function(usr) {
    req.session.user = usr;
    return usr;
  });
};

// DELETE /api/account
//
// Deletes account and removes all sessions
// associated with user.

exports.delete_account = function(req, db) {
  return session.current_user(req, db).
  then(function(usr) {
    return user.delete(usr.user_id);
  }).
  then(function(usr) {
    return session.delete(req, usr.user_id);
  });
};
