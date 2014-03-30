var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');

// req.session.user: user logged in
// req.params.user: requested user

// GET /api/users/:userName
//
// Returns the requested user information.
//
// \get_param  user the requested username
// \return {
//   username:string
//   user_id:integer
// }

exports.user = function(req, res) {
  if (req.session.user) {
    if (req.params.user && (
          req.session.user.user_id === req.params.user.user_id ||
          req.session.user.role === 'debug')) {
      res.json(req.params.user);
    } else {
      // User is not found or current user is unauthorized.
      // In either case return 'user not found'.
      res.json(404, { message: 'user not found' });
    }
  } else {
    common.requireAuth(req, res);
  }
}

// GET /api/users/:userName/ledgers
//
// Returns the requested users ledgers
//
// \get_param  user the requested username
// \return [{
//  title:string
//  currency_id:integer
//  ledger_id:integer 
// }]

exports.ledgers = function(req, res) {
  if (req.session.user) {
    if (req.params.user && (
          req.session.user.user_id === req.params.user.user_id ||
          req.session.user.role === 'debug')) {
      db.query('select title, currency_id, ledger_id from ledger natural join owner where user_id = $1;',
          [req.params.user.user_id], function(err, result) {
        if (err) {
          console.error(__filename+':ledgers: failed to load ledgers');
          res.json(500, { message: 'server error' });
        } else {
          res.json(result.rows);
        }
      });
    } else {
      // User is not found or current user is unauthorized.
      // In either case return 'user not found'.
      res.json(404, { message: 'user not found' });
    }
  } else {
    common.requireAuth(req, res);
  }
}

// GET /api/users
//
// Returns all users in the system.
//
// \return [{
//   username:string
//   user_id:integer
// }]

exports.users = function(req, res) {
  if (req.session.user && req.session.user.role === 'debug') {
    db.query('select username, role, user_id from "user";',
        [], function(err, result) {
      if (err) {
        console.error(__filename+':users: failed to load user');
        res.json(500, { message: 'server error' });
      } else {
        res.json(result.rows);
      }
    });
  } else {
    common.requireAuth(req, res);
  }
}

// Parses :userName GET parameter

exports.param = {};
exports.param.user = function(req, res, next, id) {
  db.query('select username, role, user_id from "user" where username = $1;',
      [id], function(err, result) {
    if (err) {
      console.error(__filename+':param.user: failed to load user');
      res.json(500, { message: 'server error' });
    } else if (result.rowCount > 0) {
      req.params.user = result.rows[0];
    } else {
      // user not found
    }
    next();
  });
}




