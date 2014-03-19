var crypto = require('crypto');
var auth = require('basic-auth');
var buffertools = require('buffertools');
var db = require('./db');

// requires session middleware to be present

module.exports = function(req, res, next) {
  if (!req.session.user) {
    var user = auth(req);
    if (user) {
      authenticate(user, req, res, next);
      return;
    }
  }
  next();
}

function authenticate(user, req, res, next) {
  db.query(
      'select username, user_id, pass, salt from userdata where username = $1;',
      [user.name], function(err, result) {
    if (err) {
      console.error('failed to load userdata');
      res.json(500, { message: 'server error' });
    } else if (result.rowCount > 0) {
      var userdata = result.rows[0];
      console.log('calculating hash...');
      crypto.pbkdf2(user.pass, userdata.salt, 10000, 32, function(err, pass) {
        if (err) {
          console.error('failed to calculate hash');
          res.json(500, { message: 'server error' });
        } else {
          if (buffertools.equals(pass,userdata.pass)) {
            // save session
            req.session.user = {
              username: userdata.username,
              user_id: userdata.user_id
            };
          } else {
            // user and pass do not match
          }
          next();
        }
      });
    } else {
      // user not found
      next();
    }
  });
}
