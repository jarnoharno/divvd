var crypto = require('crypto');
var common = require('./common');
var auth = require('../lib/auth');
var user = require('../dao/user');
var session = require('../lib/session');

// req.session.user // user logged in
// req.params.user // requested user

// GET /api/account
//
// Returns the logged in user information
//
// \return {
//   username:string
//   role:string
//   user_id:integer
// }

exports.account = function(req, res) {
  session.current_user(req).
  then(function(usr) {
    res.json(usr);
  });
};

// GET /api/logout
//
// Logs out user
//
// \return {
//   username:string
//   role:string
//   user_id:integer
// }

exports.logout = function(req, res) {
  session.current_user(req).
  then(function(usr) {
    session.delete_current(req);
    res.json(usr);
  });
};

// POST /api/login
//
// Logs user in
//
// \postparam username username
// \postparam password password
// \return {
//   username:string
//   role:string
//   user_id:integer
// }

exports.login = function(req, res) {
  user.find_username_and_password(req.body).
  then(function(usr) {
    req.session.user = usr;
    res.json(usr);
  });
};

// POST /api/signup
//
// Signs user up
//
// \postparam username username
// \postparam password password
// \return {
//   username:string
//   role:string
//   user_id:integer
// }

exports.signup = function(req, res) {
  user.create(req.body).
  then(function(usr) {
    req.session.user = usr;
    res.json(usr);
  });
};

// DELETE /api/account
//
// Deletes account and removes all sessions
// associated with user.
//
// \return {
//   username:string
//   role:string
//   user_id:integer
// }

exports.delete_account = function(req, res) {
  session.current_user(req).
  then(function(usr) {
    session.delete_current(req);
    return user.delete(usr.user_id).
    then(function() {
      res.json(usr);
    });
  });
};
