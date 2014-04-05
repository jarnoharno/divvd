var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');
var Hox = require('../lib/hox');
var user = require('../dao/user');
var session = require('../lib/session');

// req.session.user: user logged in
// req.params.user: requested user

// GET /api/users/:userName
//
// Returns the requested user information.
//
// \get_param  user the requested username
// \return {
//   username:string
//   role:string
//   user_id:integer
// }

exports.user = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.user_id === req.params.user.user_id ||
            me.role.match(/debug|admin/);
  }).
  then(function() {
    res.json(req.params.user);
  }).
  catch(common.handle(res));
}

// GET /api/users/:userName/ledgers
//
// Returns the requested user's ledgers
//
// \get_param  user the requested username
// \return [{
//   title:string
//   currency_id:integer
//   ledger_id:integer
// }]

exports.ledgers = function(req, res) {
  session.authorize_spoof(req, function(me) {
    console.log('TEST');
    console.log(me);
    console.log(req.params.user);
    return  me.user_id === req.params.user.user_id ||
            me.role.match(/debug|admin/);
  }).
  then(function() {
    return ledger.find_by_user_id(req.params.user.user_id);
  }).
  then(function(ledgers) {
    res.json(ledgers);
  }).
  catch(common.handle(res));
}

// GET /api/users
//
// Returns all users in the system. Not available to users.
//
// \return [{
//   username:string
//   role:string
//   user_id:integer
// }]

exports.users = function(req, res) {
  if (req.session.user && (
        req.session.user.role === 'debug' ||
        req.session.user.role === 'admin' )) {
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

// DELETE /api/users/:userId
//
// Remove user from the system and all sessions
// associated with the user. Not available to debug users.
//
// \return {
//   username:string
//   role:string
// }
exports.delete_user = function(req, res) {
  if (req.session.user) {
    if (req.params.user && (
          req.session.user.user_id === req.params.user.user_id ||
          req.session.user.role === 'admin' )) {
      db.query('delete from "user" where user_id = $1 returning username, role, user_id;',
          [req.params.user.user_id],
          function(err, result) {
        if (err) {
          console.error('failed to delete user');
          res.json(500, { message: 'server error' });
        } else if (result.rowCount == 0) {
          // user should definitely be available
          console.error('failed to find user to delete');
          res.json(500, { message: 'server error' });
        } else {
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
            delete req.session.user;
            delete user.user_id;
            res.json(user);
          });
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

// Parses :user GET parameter

exports.param = {};
exports.param.user = function(req, res, next, id) {
  user.find_username(id).
  then(function(usr) {
    req.params.user = usr;
    next();
  }).
  catch(common.handle(res));
}
