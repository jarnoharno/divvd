var crypto = require('crypto');
var db = require('../lib/db');
var common = require('./common');

// req.session.user // user logged in
// req.params.user // requested user
// user { username: string, user_id: number }

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

exports.param = {};

exports.param.user = function(req, res, next, id) {
  db.query('select username, role, user_id from userdata where username = $1;',
      [id], function(err, result) {
    if (err) {
      console.error('failed to load userdata');
    } else if (result.rowCount > 0) {
      req.params.user = result.rows[0];
    } else {
      // user not found
    }
    next();
  });
}

