var db = require('../db.js');

exports.user = function(req, res) {
  if (req.user) {
    res.json({ username: req.user });
  } else {
    res.json({ message: 'user not found' });
  }
}

exports.param = {};

exports.param.user = function(req, res, next, id) {
  db.query('select username from userdata where username = $1;',
      [id], function(err, result) {
    if (err) {
      console.error('failed to load user "' + id + '"');
    } else if (result.rowCount > 0) {
      req.user = result.rows[0].username;
    } else {
      // user not found
    }
    next();
  });
}

