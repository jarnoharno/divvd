var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');
var auth = require('../lib/auth');

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
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    // We don't want to send unauthorized just to log user out
    res.json(400, { message: 'not logged in' });
  }
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
  if (req.session.user) {
    var ret = req.session.user;
    delete req.session.user;
    res.json(ret);
  } else {
    // We don't want to send unauthorized just to log user out
    res.json(400, { message: 'not logged in' });
  }
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
  auth.auth(req.body, req, res, function(err) {
    if (err) {
      common.requireAuthCustom(req, res, true);
    } else {
      // session.user is available after successful auth
      res.json(req.session.user);
    }
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
  auth.signup(req.body, req, res);
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
  if (!req.session.user) {
    // 400 Bad request might not be the perfect
    // response here. Perhaps 409 Conflict should be used?
    res.json(400, { message: "not logged in" });
    return;
  }
  db.query('delete from "user" where user_id = $1 returning username, role, user_id;',
    [req.session.user.user_id],
    function(err, result) {
    if (err) {
      console.error('failed to delete user');
      res.json(500, { message: "server error" });
      return;
    }
    if (result.rowCount == 0) {
      // there definitely should be a user so there is something wrong
      // with the server
      console.error('failed to find user to delete');
      res.json(500, { message: "server error" });
      return;
    }
    var user = result.rows[0];
    // delete session data and respond
    // this depends on sessionStore providing 'all' method, which is
    // the case with the default express session memory store
    req.sessionStore.all(function(err, sessions) {
      if (err) {
        console.error('failed to access session data');
        res.json(500, { message: 'server error' });
        return;
      }
      sessions.forEach(function(session) {
        if (session.user && session.user.user_id == user.user_id) {
          delete session.user;
        }
      });
      // delete local session so express doesn't set it up again
      delete req.session.user;
      // don't return nonexistent user id
      delete user.user_id;
      res.json(user);
    });
  });
};
