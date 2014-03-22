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
// remember to attach json content-type header to ensure correct parsing!
exports.login = function(req, res) {
  auth.auth(req.body, req, res, function(err) {
    if (err) {
      common.requireAuthCustom(req, res, true);
    } else {
      // session.user is now available
      res.json(req.session.user);
    }
  });
};

exports.signup = function(req, res) {
  auth.signup(req.body, req, res);
};
