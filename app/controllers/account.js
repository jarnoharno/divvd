var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');
var auth = require('../lib/auth');

// req.session.user // user logged in
// req.params.user // requested user

exports.account = function(req, res) {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    common.requireAuthCustom(req, res, true);
  }
};

exports.logout = function(req, res) {
  if (req.session.user) {
    delete req.session.user;
  }
  res.json({ message: 'done' });
};

// login and signup use json post data
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

exports.signup = function(req, res) {
  auth.signup(req.body, req, res);
};

exports.delete_account = function(req, res) {
  if (!req.session.user) {
    // 400 Bad request might not be the perfect
    // response here. Perhaps 409 Conflict should be used?
    res.json(400, { message: "not logged in" });
    return;
  }
  db.query('delete from "user" where user_id = $1 returning username;',
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
    // delete session data and respond
    delete req.session.user;
    res.json(200, result.rows[0]);
  });
};
