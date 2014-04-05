var crypto = require('crypto');
var common = require('./common');
var Hox = require('../lib/hox');
var user = require('../dao/user');
var session = require('../lib/session');
var ledger = require('../dao/ledger');

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
  session.authorize(req, function(me) {
    return me.role.match(/debug|admin/);
  }).then(function() {
    return user.all();
  }).then(function(users) {
    res.json(users);
  }).
  catch(common.handle(res));
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
exports.delete = function(req, res) {
  session.authorize_spoof(req, function(me) {
    return  me.user_id === req.params.user.user_id ||
            me.role.match(/admin/);
  }).
  then(function() {
    return user.delete(req.params.user.user_id);
  }).
  then(function(usr) {
    return session.delete(req, usr.user_id).
    then(function() {
      res.json(usr);
    });
  }).
  catch(common.handle(res));
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
