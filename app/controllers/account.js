var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');

// req.session.user // user logged in
// req.params.user // requested user
// user { username: string, user_id: number }

exports.account = function(req, res) {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    common.requireAuth(req, res);
  }
}
